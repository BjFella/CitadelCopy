#!/usr/bin/env node

/**
 * context-compress MCP server
 *
 * Provides smart_read and smart_bash tools that compress large outputs
 * before they land in Claude's context window.
 *
 * Research basis: Morph (2026) -- context rot degrades all models as context
 * grows. Raw file reads and verbose command outputs are the primary blowout
 * vectors in campaign sessions.
 *
 * Compression strategy (no LLM call needed -- structural heuristics):
 *   smart_read:
 *     < 300 lines  → full content (no compression)
 *     300-1000     → first 80 + function/class/export index + tail 20
 *     > 1000       → first 50 + structural index + tail 10 + section guide
 *
 *   smart_bash:
 *     < 100 lines  → full output
 *     100-500      → first 40 + all error/warning lines + tail 20 + stats
 *     > 500        → first 30 + all error lines (max 50) + tail 10 + stats
 *
 * Enable: add to ~/.claude/settings.json mcpServers (see README below).
 * Disable: remove from mcpServers. Native Read/Bash resume automatically.
 *
 * Enable for a project only:
 *   Add to .claude/settings.json instead of global settings.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SECRET_BASENAMES = new Set([
  '.git-credentials',
  '.netrc',
  '.npmrc',
  '.pypirc',
  '.vault-token',
  'credentials',
  'credentials.json',
  'id_ed25519',
  'id_rsa',
  'service-account.json',
]);
const SECRET_EXTENSIONS = new Set(['.kdbx', '.key', '.p12', '.pem', '.pfx']);
const SECRET_DIRECTORIES = new Set(['.git', '.gnupg', '.ssh']);
const SECRET_RELATIVE_PATHS = new Set([
  '.aws/credentials',
  '.azure/accesstokens.json',
  '.claude/compact-state.json',
  '.claude/harness.json',
  '.claude/settings.local.json',
  '.codex/auth.json',
  '.config/gcloud/application_default_credentials.json',
  '.docker/config.json',
  '.kube/config',
]);

function realpath(filePath) {
  return fs.realpathSync.native
    ? fs.realpathSync.native(filePath)
    : fs.realpathSync(filePath);
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (
    relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative)
  );
}

function configureProjectRoot(env = process.env) {
  const configured = env.CITADEL_PROJECT_ROOT;
  if (typeof configured !== 'string' || configured.trim() === '') {
    return {
      error: 'Project root is not configured. Set CITADEL_PROJECT_ROOT to an absolute, existing directory.',
    };
  }
  if (!path.isAbsolute(configured)) {
    return { error: 'CITADEL_PROJECT_ROOT must be an absolute path.' };
  }

  const resolved = path.resolve(configured);
  try {
    const canonical = realpath(resolved);
    if (!fs.statSync(canonical).isDirectory()) {
      return { error: 'CITADEL_PROJECT_ROOT must identify an existing directory.' };
    }
    return { configured: resolved, canonical };
  } catch (_) {
    return { error: 'CITADEL_PROJECT_ROOT must identify an existing directory.' };
  }
}

const PROJECT_ROOT = configureProjectRoot();

function relativePolicyPath(root, candidate) {
  return path.relative(root, candidate).split(path.sep).join('/').toLowerCase();
}

function secretLikeReason(root, candidate) {
  const relative = relativePolicyPath(root, candidate);
  const segments = relative.split('/').filter(Boolean);
  const basename = segments.at(-1) || '';

  // Native Read protection blocks every .env* variant, including templates.
  if (segments.some((segment) => segment.startsWith('.env'))) return 'dotenv files are protected';
  if (process.platform === 'win32' && segments.some((segment) => segment.includes(':'))) {
    return 'alternate data streams are protected';
  }
  if (segments.some((segment) => SECRET_DIRECTORIES.has(segment))) return 'private credential state is protected';
  if (SECRET_BASENAMES.has(basename)) return 'credential files are protected';
  if (SECRET_EXTENSIONS.has(path.extname(basename))) return 'key and credential files are protected';
  if (SECRET_RELATIVE_PATHS.has(relative)) return 'private runtime state is protected';
  if (/^\.claude\/(?:consent-(?:session|onetime)-[^/]+\.json|remote[-_]?attachments)(?:\/|$)/.test(relative)) {
    return 'private runtime state is protected';
  }
  return null;
}

function resolveReadPath(filePath) {
  if (PROJECT_ROOT.error) return { error: PROJECT_ROOT.error };
  if (typeof filePath !== 'string' || filePath.trim() === '' || filePath.includes('\0')) {
    return { error: 'A non-empty file path is required.' };
  }

  const candidate = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(PROJECT_ROOT.canonical, filePath);
  const lexicalRoot = isWithin(PROJECT_ROOT.canonical, candidate)
    ? PROJECT_ROOT.canonical
    : (isWithin(PROJECT_ROOT.configured, candidate) ? PROJECT_ROOT.configured : null);

  if (!lexicalRoot) return { error: 'Refusing to read outside the configured project root.' };

  const requestedSecret = secretLikeReason(lexicalRoot, candidate);
  if (requestedSecret) return { error: `Refusing to read this path: ${requestedSecret}.` };

  let canonical;
  try {
    canonical = realpath(candidate);
  } catch (_) {
    return { error: 'File not found inside the configured project root.' };
  }

  // realpath resolves POSIX symlinks plus Windows symlinks and junctions. The
  // second boundary check prevents an in-project link from escaping the root.
  if (!isWithin(PROJECT_ROOT.canonical, canonical)) {
    return { error: 'Refusing to read outside the configured project root.' };
  }

  const canonicalSecret = secretLikeReason(PROJECT_ROOT.canonical, canonical);
  if (canonicalSecret) return { error: `Refusing to read this path: ${canonicalSecret}.` };

  return { path: canonical };
}

// ── MCP JSON-RPC server ───────────────────────────────────────────────────────

const TOOL_DEFS = [
  {
    name: 'smart_read',
    description: [
      'Read a file with automatic context compression for large files.',
      'Use instead of the native Read tool when reading files that may be large.',
      'Returns full content for small files, a compressed structural view for large ones.',
      'For targeted reading of a known section, prefer native Read with limit/offset.',
    ].join(' '),
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        path: {
          type: 'string',
          description: [
            'Path to a file inside the configured CITADEL_PROJECT_ROOT.',
            'Relative paths resolve against that root; absolute in-project paths are accepted.',
            'Dotenv and common credential/key files are always refused.',
          ].join(' '),
        },
        hint: {
          type: 'string',
          description: 'Optional: what you are looking for (e.g. "the renderItem function"). Helps compress toward relevant content.',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'smart_bash',
    description: [
      'Run a shell command with automatic output compression for verbose results.',
      'Use instead of native Bash when the command may produce large output',
      '(typecheck, build, test runs, find, grep across many files).',
      'For short commands or when you need exact output, use native Bash.',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to run.',
        },
        cwd: {
          type: 'string',
          description: 'Working directory (optional, defaults to process cwd).',
        },
        timeout_ms: {
          type: 'number',
          description: 'Timeout in milliseconds (default 30000).',
        },
      },
      required: ['command'],
    },
  },
];

// ── smart_read implementation ─────────────────────────────────────────────────

const FULL_THRESHOLD = 300;
const LARGE_THRESHOLD = 1000;

function extractStructuralIndex(lines) {
  const patterns = [
    // TypeScript / JavaScript
    { re: /^export\s+(default\s+)?(function|class|const|let|interface|type|enum)\s+(\w+)/, label: 'export' },
    { re: /^(export\s+)?(async\s+)?function\s+(\w+)/, label: 'fn' },
    { re: /^(export\s+)?class\s+(\w+)/, label: 'class' },
    { re: /^\s+(public|private|protected|static)?\s*(async\s+)?(\w+)\s*\(/, label: 'method' },
    { re: /^const\s+(\w+)\s*=\s*(async\s+)?\(|^const\s+(\w+)\s*=\s*function/, label: 'const-fn' },
    // Python
    { re: /^def\s+(\w+)/, label: 'def' },
    { re: /^class\s+(\w+)/, label: 'class' },
    // General headings
    { re: /^##\s+(.+)/, label: 'section' },
    { re: /^#{1,3}\s+(.+)/, label: 'heading' },
  ];

  const index = [];
  lines.forEach((line, i) => {
    for (const { re, label } of patterns) {
      const m = line.match(re);
      if (m) {
        const name = m[3] || m[2] || m[1] || m[0].trim().slice(0, 60);
        if (name && name.length < 80) {
          index.push(`  L${i + 1}: [${label}] ${name.trim()}`);
        }
        break;
      }
    }
  });

  return index;
}

function smartRead(filePath, hint) {
  const resolved = resolveReadPath(filePath);
  if (resolved.error) return resolved;
  const abs = resolved.path;

  let stat;
  try {
    stat = fs.statSync(abs);
  } catch (e) {
    return { error: `Cannot inspect file: ${e.message}` };
  }
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(abs)
      .filter((entry) => !secretLikeReason(PROJECT_ROOT.canonical, path.join(abs, entry)))
      .slice(0, 50)
      .join('\n');
    return { content: `Directory listing (${abs}):\n${entries}` };
  }
  if (!stat.isFile()) return { error: 'Refusing to read a non-regular file.' };

  let raw;
  let descriptor;
  try {
    const noFollow = fs.constants.O_NOFOLLOW || 0;
    descriptor = fs.openSync(abs, fs.constants.O_RDONLY | noFollow);
    if (!fs.fstatSync(descriptor).isFile()) return { error: 'Refusing to read a non-regular file.' };
    raw = fs.readFileSync(descriptor, 'utf8');
  } catch (e) {
    return { error: `Cannot read file: ${e.message}` };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }

  const lines = raw.split('\n');
  const total = lines.length;
  const ext = path.extname(abs);

  if (total <= FULL_THRESHOLD) {
    return {
      content: raw,
      meta: `[smart_read] ${total} lines — full content returned`,
    };
  }

  const index = extractStructuralIndex(lines);
  const hintNote = hint ? `  Searching for: "${hint}"\n` : '';

  if (total <= LARGE_THRESHOLD) {
    const head = lines.slice(0, 80).join('\n');
    const tail = lines.slice(-20).join('\n');
    const indexStr = index.length > 0 ? `\nStructural index:\n${index.join('\n')}` : '';

    return {
      content: [
        `[smart_read] ${abs} — ${total} lines (compressed)`,
        hintNote,
        `--- LINES 1-80 ---`,
        head,
        `--- LINES ${total - 19}-${total} ---`,
        tail,
        indexStr,
        `\nTo read a specific section: use native Read with offset and limit params.`,
      ].filter(Boolean).join('\n'),
      meta: `compressed: ${total} lines → head/tail/index`,
    };
  }

  // Very large file
  const head = lines.slice(0, 50).join('\n');
  const tail = lines.slice(-10).join('\n');
  const indexStr = index.length > 0 ? `\nStructural index (${index.length} symbols):\n${index.slice(0, 40).join('\n')}` : '';

  // Section guide: every ~100 lines, show a representative line
  const sectionGuide = [];
  for (let i = 100; i < total - 100; i += 100) {
    const sample = lines[i].trim().slice(0, 80);
    if (sample) sectionGuide.push(`  L${i + 1}: ${sample}`);
  }
  const sectionStr = sectionGuide.length > 0 ? `\nSection guide (every 100 lines):\n${sectionGuide.join('\n')}` : '';

  return {
    content: [
      `[smart_read] ${abs} — ${total} lines (heavily compressed)`,
      hintNote,
      `--- LINES 1-50 ---`,
      head,
      `--- LINES ${total - 9}-${total} ---`,
      tail,
      indexStr,
      sectionStr,
      `\nFile has ${total} lines. Use native Read with offset/limit to target a section.`,
      `Example: Read path="${abs}" offset=200 limit=100`,
    ].filter(Boolean).join('\n'),
    meta: `compressed: ${total} lines → head/tail/index/guide`,
  };
}

// ── smart_bash implementation ─────────────────────────────────────────────────

const BASH_FULL_THRESHOLD = 100;
const BASH_LARGE_THRESHOLD = 500;

function smartBash(command, cwd, timeoutMs) {
  const opts = {
    cwd: cwd || process.cwd(),
    timeout: timeoutMs || 30000,
    maxBuffer: 10 * 1024 * 1024, // 10 MB
    stdio: ['pipe', 'pipe', 'pipe'],
  };

  let stdout = '';
  let stderr = '';
  let exitCode = 0;

  try {
    stdout = execSync(command, { ...opts, encoding: 'utf8' });
  } catch (e) {
    stdout = e.stdout || '';
    stderr = e.stderr || '';
    exitCode = e.status || 1;
  }

  const combined = (stdout + (stderr ? '\n[stderr]\n' + stderr : '')).trimEnd();
  const lines = combined.split('\n');
  const total = lines.length;

  if (total <= BASH_FULL_THRESHOLD) {
    return {
      content: combined || '(no output)',
      exitCode,
      meta: `[smart_bash] ${total} lines — full output`,
    };
  }

  // Extract error and warning lines (cap at 50)
  const errorLines = lines
    .map((l, i) => ({ line: l, n: i + 1 }))
    .filter(({ line }) => /\b(error|Error|ERROR|fail|FAIL|warn|WARNING)\b/.test(line))
    .slice(0, 50)
    .map(({ line, n }) => `  L${n}: ${line}`);

  if (total <= BASH_LARGE_THRESHOLD) {
    const head = lines.slice(0, 40).join('\n');
    const tail = lines.slice(-20).join('\n');
    const errStr = errorLines.length > 0 ? `\nErrors/warnings (${errorLines.length}):\n${errorLines.join('\n')}` : '';

    return {
      content: [
        `[smart_bash] exit ${exitCode} — ${total} lines (compressed)`,
        `Command: ${command}`,
        `--- LINES 1-40 ---`,
        head,
        `--- LINES ${total - 19}-${total} ---`,
        tail,
        errStr,
        `\nFull output: ${total} lines, exit ${exitCode}.`,
      ].filter(Boolean).join('\n'),
      exitCode,
      meta: `compressed: ${total} lines → head/tail/errors`,
    };
  }

  // Very large output
  const head = lines.slice(0, 30).join('\n');
  const tail = lines.slice(-10).join('\n');
  const errStr = errorLines.length > 0 ? `\nErrors/warnings (${errorLines.length}):\n${errorLines.join('\n')}` : '\n(no error/warning lines found)';

  return {
    content: [
      `[smart_bash] exit ${exitCode} — ${total} lines (heavily compressed)`,
      `Command: ${command}`,
      `--- LINES 1-30 ---`,
      head,
      `--- LINES ${total - 9}-${total} ---`,
      tail,
      errStr,
      `\nFull output: ${total} lines, exit ${exitCode}. Use native Bash to re-run if you need full output.`,
    ].filter(Boolean).join('\n'),
    exitCode,
    meta: `compressed: ${total} lines → head/tail/errors only`,
  };
}

// ── MCP protocol ─────────────────────────────────────────────────────────────

function respond(id, result) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(msg + '\n');
}

function respondError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  process.stdout.write(msg + '\n');
}

function handleRequest(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    respond(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'context-compress', version: '1.0.1' },
    });
    return;
  }

  if (method === 'notifications/initialized') return;

  if (method === 'tools/list') {
    respond(id, { tools: TOOL_DEFS });
    return;
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};

    if (name === 'smart_read') {
      const result = smartRead(args?.path || '', args?.hint || '');
      if (result.error) {
        respond(id, {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        });
      } else {
        respond(id, {
          content: [{ type: 'text', text: result.content }],
        });
      }
      return;
    }

    if (name === 'smart_bash') {
      const result = smartBash(args?.command || '', args?.cwd, args?.timeout_ms);
      respond(id, {
        content: [{ type: 'text', text: result.content }],
      });
      return;
    }

    respondError(id, -32601, `Unknown tool: ${name}`);
    return;
  }

  if (id !== undefined) {
    respondError(id, -32601, `Unknown method: ${method}`);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep incomplete line
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      handleRequest(JSON.parse(trimmed));
    } catch (e) {
      // Malformed JSON -- ignore
    }
  }
});

process.stdin.on('end', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
