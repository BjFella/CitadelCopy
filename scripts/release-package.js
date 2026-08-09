#!/usr/bin/env node

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_NAME = '.citadel-release.json';
const RELEASE_FILES_NAME = 'release-files.json';
const MATRIX = { operatingSystems: ['linux', 'macos', 'windows'], node: ['18', '20'], runtimes: ['claude', 'codex'] };

function compareNames(left, right) {
  return left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function arg(name, fallback = null) {
  const inline = process.argv.find((value) => value.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function runGit(args, cwd, encoding = 'utf8') {
  return execFileSync('git', args, { cwd, encoding, stdio: ['ignore', 'pipe', 'pipe'] });
}

function gitValue(args, cwd, fallback) {
  try {
    return String(runGit(args, cwd)).trim() || fallback;
  } catch {
    return fallback;
  }
}

function isExcluded(relativePath, tracked) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === MANIFEST_NAME) return true;
  if (/^(?:\.git|node_modules|dist)(?:\/|$)/.test(normalized)) return true;
  if (normalized.startsWith('.planning/')) {
    const distributablePlanning = normalized.startsWith('.planning/_templates/')
      || normalized.startsWith('.planning/rubrics/')
      || normalized === '.planning/intake/_TEMPLATE.md';
    if (!distributablePlanning || !tracked) return true;
  }
  return false;
}

function worktreeEntries(sourceDir) {
  let tracked = new Set();
  let names;
  try {
    tracked = new Set(String(runGit(['ls-files', '-c', '-z'], sourceDir)).split('\0').filter(Boolean));
    names = [...tracked];
    const policyPath = path.join(sourceDir, RELEASE_FILES_NAME);
    if (fs.existsSync(policyPath)) {
      const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8').replace(/^\uFEFF/, ''));
      for (const relative of [RELEASE_FILES_NAME, ...(Array.isArray(policy.includeFiles) ? policy.includeFiles : [])]) {
        if (!tracked.has(relative) && fs.existsSync(path.join(sourceDir, ...relative.split('/')))) names.push(relative);
      }
    }
  } catch {
    names = [];
    const walk = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        const relative = path.relative(sourceDir, absolute).replace(/\\/g, '/');
        if (isExcluded(relative, false)) continue;
        if (entry.isDirectory()) walk(absolute);
        else if (entry.isFile()) names.push(relative);
      }
    };
    walk(sourceDir);
  }
  return [...new Set(names)].filter((name) => {
    const absolute = path.join(sourceDir, ...name.split('/'));
    return fs.existsSync(absolute) && !isExcluded(name, tracked.has(name));
  }).sort().map((name) => {
    const absolute = path.join(sourceDir, ...name.split('/'));
    const stat = fs.statSync(absolute);
    return { name, data: fs.readFileSync(absolute), mode: stat.mode & 0o111 ? 0o755 : 0o644 };
  });
}

function refEntries(sourceDir, ref) {
  const records = String(runGit(['ls-tree', '-r', '-z', ref], sourceDir)).split('\0').filter(Boolean);
  return records.map((record) => {
    const match = /^(\d+)\s+\w+\s+[0-9a-f]+\t(.+)$/.exec(record);
    if (!match) throw new Error(`Cannot parse git tree record: ${record}`);
    const name = match[2].replace(/\\/g, '/');
    const data = runGit(['show', `${ref}:${name}`], sourceDir, null);
    return { name, data, mode: match[1] === '100755' ? 0o755 : 0o644 };
  }).filter((entry) => !isExcluded(entry.name, true)).sort(compareNames);
}

function jsonFromEntries(entries, name) {
  const entry = entries.find((candidate) => candidate.name === name);
  if (!entry) throw new Error(`Release source is missing ${name}`);
  return JSON.parse(entry.data.toString('utf8').replace(/^\uFEFF/, ''));
}

function releasePolicy(entries) {
  const policy = jsonFromEntries(entries, RELEASE_FILES_NAME);
  const fields = [
    'includeFiles', 'includeDirectories', 'excludeFiles',
    'excludeDirectories', 'excludePrefixes', 'excludeSegments',
  ];
  if (policy.schema !== 1) throw new Error(`Unsupported ${RELEASE_FILES_NAME} schema: ${policy.schema}`);
  for (const field of fields) {
    if (!Array.isArray(policy[field]) || policy[field].some((value) => typeof value !== 'string' || !value)) {
      throw new Error(`${RELEASE_FILES_NAME} field ${field} must be an array of non-empty strings`);
    }
    if (new Set(policy[field]).size !== policy[field].length) {
      throw new Error(`${RELEASE_FILES_NAME} field ${field} contains duplicates`);
    }
  }
  for (const file of [...policy.includeFiles, ...policy.excludeFiles]) {
    if (file.endsWith('/')) throw new Error(`${RELEASE_FILES_NAME} file rule must not end with /: ${file}`);
  }
  for (const directory of [...policy.includeDirectories, ...policy.excludeDirectories]) {
    if (!directory.endsWith('/')) throw new Error(`${RELEASE_FILES_NAME} directory rule must end with /: ${directory}`);
  }
  for (const rule of fields.flatMap((field) => policy[field])) {
    const normalized = rule.replace(/\\/g, '/');
    if (normalized !== rule || normalized.startsWith('/') || normalized.split('/').includes('..')) {
      throw new Error(`Unsafe ${RELEASE_FILES_NAME} rule: ${rule}`);
    }
  }
  return policy;
}

function applyReleasePolicy(entries) {
  const policy = releasePolicy(entries);
  const available = new Set(entries.map((entry) => entry.name));
  for (const file of policy.includeFiles) {
    if (!available.has(file)) throw new Error(`${RELEASE_FILES_NAME} includes missing file: ${file}`);
  }
  for (const directory of policy.includeDirectories) {
    if (![...available].some((name) => name.startsWith(directory))) {
      throw new Error(`${RELEASE_FILES_NAME} includes empty directory: ${directory}`);
    }
  }
  return entries.filter((entry) => {
    const name = entry.name;
    const included = policy.includeFiles.includes(name)
      || policy.includeDirectories.some((directory) => name.startsWith(directory));
    if (!included) return false;
    if (policy.excludeFiles.includes(name)) return false;
    if (policy.excludeDirectories.some((directory) => name.startsWith(directory))) return false;
    if (policy.excludePrefixes.some((prefix) => name.startsWith(prefix))) return false;
    if (policy.excludeSegments.some((segment) => name.split('/').includes(segment))) return false;
    return true;
  }).sort(compareNames);
}

function sanitizeReleasePackage(entries) {
  const pkg = jsonFromEntries(entries, 'package.json');
  const releasePackage = {
    name: pkg.name,
    version: pkg.version,
    private: true,
    description: 'Verified Citadel GitHub release artifact and lifecycle CLI',
    license: pkg.license,
    bin: pkg.bin,
    scripts: {
      'citadel:install': 'node scripts/install.js',
      'claude:install': 'node scripts/claude-install.js',
      'codex:install': 'node scripts/codex-install.js',
      'release:verify': 'node scripts/release-verify.js',
      update: 'node scripts/update.js',
    },
    repository: pkg.repository,
    engines: pkg.engines,
    citadelRelease: {
      channel: 'github-release-trio',
      lifecycleCommands: ['install', 'doctor', 'update', 'rollback', 'uninstall'],
    },
  };
  const data = Buffer.from(`${JSON.stringify(releasePackage, null, 2)}\n`);
  return entries.map((entry) => (entry.name === 'package.json' ? { ...entry, data } : entry));
}

function sanitizeReleaseMcp(entries) {
  if (!entries.some((entry) => entry.name === '.mcp.json')) return entries;
  const config = jsonFromEntries(entries, '.mcp.json');
  const state = config.mcpServers?.['citadel-state'];
  if (!state) throw new Error('Release MCP config requires citadel-state');
  const data = Buffer.from(`${JSON.stringify({ mcpServers: { 'citadel-state': state } }, null, 2)}\n`);
  return entries.map((entry) => (entry.name === '.mcp.json' ? { ...entry, data } : entry));
}

function sanitizeReleaseRouting(entries) {
  const tableName = 'core/skills/routing-table.json';
  const doName = 'skills/do/SKILL.md';
  const hasTable = entries.some((entry) => entry.name === tableName);
  const hasDo = entries.some((entry) => entry.name === doName);
  if (!hasTable && !hasDo) return entries;
  if (!hasTable || !hasDo) throw new Error('Release routing requires both routing-table.json and skills/do/SKILL.md');
  const shippedSkills = new Set(entries.map((entry) => {
    const match = /^skills\/([^/]+)\/SKILL\.md$/.exec(entry.name);
    return match?.[1] || null;
  }).filter(Boolean));
  const table = jsonFromEntries(entries, tableName);
  table.skills = (table.skills || []).filter((skill) => shippedSkills.has(skill.name));
  const doEntry = entries.find((entry) => entry.name === doName);
  if (!doEntry) throw new Error(`Release source is missing ${doName}`);
  const lines = doEntry.data.toString('utf8').split(/\r?\n/);
  let inRoutingTable = false;
  const filtered = lines.filter((line) => {
    if (line === '<!-- BEGIN GENERATED: routing-table -->') inRoutingTable = true;
    if (line === '<!-- END GENERATED: routing-table -->') inRoutingTable = false;
    if (!inRoutingTable) return true;
    const match = /\| `\/([a-z0-9-]+)/.exec(line);
    return !match || shippedSkills.has(match[1]);
  });
  const sanitized = [];
  for (let index = 0; index < filtered.length; index += 1) {
    const line = filtered[index];
    if (line.startsWith('4. **Improve campaigns')) {
      sanitized.push(
        '4. **Campaign types without an installed orchestrator:** run',
        '   `node scripts/continue-action.js --run`; if it cannot resume the type, report',
        '   it under Needs You instead of inventing a route.',
      );
      while (index + 1 < filtered.length && !filtered[index + 1].startsWith('5. ')) index += 1;
      continue;
    }
    if (line.includes('**If `.planning/daemon.json` exists')) {
      sanitized.push('    - Do not mutate state owned by an orchestrator that is not installed; report it under Needs You.');
      while (index + 1 < filtered.length && !filtered[index + 1].includes('Output: "[daemon]')) index += 1;
      if (index + 1 < filtered.length) index += 1;
      continue;
    }
    sanitized.push(line);
  }
  const tableData = Buffer.from(`${JSON.stringify(table, null, 2)}\n`);
  const doData = Buffer.from(sanitized.join('\n'));
  return entries.map((entry) => {
    if (entry.name === tableName) return { ...entry, data: tableData };
    if (entry.name === doName) return { ...entry, data: doData };
    return entry;
  });
}

function sanitizeReleaseMetadata(entries) {
  const metadataName = 'citadel-metadata.json';
  if (!entries.some((entry) => entry.name === metadataName)) return entries;
  const available = new Set(entries.map((entry) => entry.name));
  const shippedSkills = entries.filter((entry) => /^skills\/[^/]+\/SKILL\.md$/.test(entry.name));
  const metadata = jsonFromEntries(entries, metadataName);
  metadata.skills = {
    ...(metadata.skills || {}),
    path: 'skills/',
    count: shippedSkills.length,
  };
  metadata.proof_links = (metadata.proof_links || []).filter((link) => {
    const target = String(link).split('#')[0];
    return target && available.has(target);
  });
  metadata.interoperability = { remote_registry_verification: 'not-claimed' };
  const data = Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`);
  return entries.map((entry) => (entry.name === metadataName ? { ...entry, data } : entry));
}

function assertVersions(entries, ref) {
  const pkg = jsonFromEntries(entries, 'package.json');
  const claude = jsonFromEntries(entries, '.claude-plugin/plugin.json');
  const marketplace = jsonFromEntries(entries, '.claude-plugin/marketplace.json');
  const codex = jsonFromEntries(entries, '.codex-plugin/plugin.json');
  const versions = [pkg.version, claude.version, marketplace.plugins?.[0]?.version, codex.version];
  if (versions.some((version) => version !== pkg.version)) {
    throw new Error(`Release version drift: ${versions.join(', ')}`);
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(pkg.version)) {
    throw new Error(`Release version is not supported SemVer: ${pkg.version}`);
  }
  if (ref && ref !== `v${pkg.version}`) {
    throw new Error(`Tag ${ref} does not match manifest version ${pkg.version}`);
  }
  return { version: pkg.version, nodeRange: pkg.engines?.node || '>=18' };
}

function assertRefMatchesCheckout(sourceDir, ref) {
  if (!ref) return;
  const pkg = JSON.parse(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'));
  if (ref !== `v${pkg.version}`) {
    throw new Error(`Tag ${ref} does not match manifest version ${pkg.version}`);
  }
}

function writeOctal(buffer, offset, length, value) {
  const encoded = Math.max(0, value).toString(8).padStart(length - 1, '0').slice(-(length - 1));
  buffer.write(encoded, offset, length - 1, 'ascii');
  buffer[offset + length - 1] = 0;
}

function splitTarPath(name) {
  if (Buffer.byteLength(name) <= 100) return { name, prefix: '' };
  for (let index = name.lastIndexOf('/'); index > 0; index = name.lastIndexOf('/', index - 1)) {
    const prefix = name.slice(0, index);
    const leaf = name.slice(index + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(leaf) <= 100) return { name: leaf, prefix };
  }
  throw new Error(`Release path exceeds ustar limits: ${name}`);
}

function tarHeader(name, size, mode, mtime) {
  const header = Buffer.alloc(512, 0);
  const parts = splitTarPath(name);
  header.write(parts.name, 0, 100, 'utf8');
  writeOctal(header, 100, 8, mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, mtime);
  header.fill(0x20, 148, 156);
  header[156] = '0'.charCodeAt(0);
  header.write('ustar\0', 257, 6, 'ascii');
  header.write('00', 263, 2, 'ascii');
  if (parts.prefix) header.write(parts.prefix, 345, 155, 'utf8');
  let checksum = 0;
  for (const byte of header) checksum += byte;
  const encoded = checksum.toString(8).padStart(6, '0').slice(-6);
  header.write(encoded, 148, 6, 'ascii');
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

function makeTar(entries, prefix, mtime) {
  const chunks = [];
  for (const entry of entries) {
    const name = `${prefix}/${entry.name}`;
    chunks.push(tarHeader(name, entry.data.length, entry.mode, mtime), entry.data);
    const remainder = entry.data.length % 512;
    if (remainder) chunks.push(Buffer.alloc(512 - remainder));
  }
  chunks.push(Buffer.alloc(1024));
  return Buffer.concat(chunks);
}

function buildRelease(options = {}) {
  const sourceDir = path.resolve(options.sourceDir || ROOT);
  const ref = options.ref || null;
  assertRefMatchesCheckout(sourceDir, ref);
  const sourceEntries = ref ? refEntries(sourceDir, ref) : worktreeEntries(sourceDir);
  const entries = sanitizeReleaseMetadata(
    sanitizeReleaseRouting(sanitizeReleaseMcp(sanitizeReleasePackage(applyReleasePolicy(sourceEntries))))
  );
  const identity = assertVersions(entries, ref);
  const commit = gitValue(['rev-parse', ref ? `${ref}^{commit}` : 'HEAD'], sourceDir, 'unknown');
  const epoch = Number(gitValue(['log', '-1', '--format=%ct', ref || 'HEAD'], sourceDir, '0')) || 0;
  const sourceRef = ref || `worktree@${commit}`;
  const prefix = `citadel-${identity.version}`;
  const internalManifest = {
    schema: 1,
    version: identity.version,
    ref: sourceRef,
    commit,
    createdAt: new Date(epoch * 1000).toISOString(),
    nodeRange: identity.nodeRange,
    runtimeMatrix: MATRIX,
    files: entries.map((entry) => ({ path: entry.name, bytes: entry.data.length, sha256: sha256(entry.data) })),
    rollbackCommand: 'node scripts/update.js --rollback <backup-path> --target <citadel-install> --apply',
  };
  const manifestData = Buffer.from(`${JSON.stringify(internalManifest, null, 2)}\n`);
  const archiveEntries = [...entries, { name: MANIFEST_NAME, data: manifestData, mode: 0o644 }]
    .sort(compareNames);
  const archive = zlib.gzipSync(makeTar(archiveEntries, prefix, epoch), { level: 9, mtime: 0 });
  const refLabel = ref ? path.basename(ref) : `v${identity.version}`;
  const archiveName = `citadel-${refLabel.replace(/[^A-Za-z0-9._-]/g, '-')}.tar.gz`;
  const archiveHash = sha256(archive);
  const externalManifest = {
    ...internalManifest,
    artifact: { file: archiveName, bytes: archive.length, sha256: archiveHash },
  };
  const outputDir = path.resolve(options.outputDir || path.join(sourceDir, 'dist', 'release'));
  fs.mkdirSync(outputDir, { recursive: true });
  const archivePath = path.join(outputDir, archiveName);
  const manifestPath = `${archivePath}.manifest.json`;
  const checksumPath = `${archivePath}.sha256`;
  fs.writeFileSync(archivePath, archive);
  fs.writeFileSync(manifestPath, `${JSON.stringify(externalManifest, null, 2)}\n`);
  fs.writeFileSync(checksumPath, `${archiveHash}  ${archiveName}\n`);
  return { archivePath, manifestPath, checksumPath, sha256: archiveHash, manifest: externalManifest };
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/release-package.js [--ref v1.1.0] [--output-dir PATH] [--dry-run] [--verify-reproducible]');
    return;
  }
  const dryRun = process.argv.includes('--dry-run');
  const reproducible = process.argv.includes('--verify-reproducible');
  const sourceDir = path.resolve(arg('--source-dir', ROOT));
  const requestedOutput = path.resolve(arg('--output-dir', path.join(sourceDir, 'dist', 'release')));
  const temporary = dryRun || reproducible ? fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-release-')) : null;
  try {
    const first = buildRelease({ sourceDir, ref: arg('--ref'), outputDir: temporary ? path.join(temporary, 'one') : requestedOutput });
    if (reproducible) {
      const second = buildRelease({ sourceDir, ref: arg('--ref'), outputDir: path.join(temporary, 'two') });
      if (first.sha256 !== second.sha256 || fs.readFileSync(first.manifestPath, 'utf8') !== fs.readFileSync(second.manifestPath, 'utf8')) {
        throw new Error('Consecutive release builds were not byte-for-byte reproducible');
      }
    }
    if (!dryRun && temporary) {
      fs.mkdirSync(requestedOutput, { recursive: true });
      for (const file of [first.archivePath, first.manifestPath, first.checksumPath]) {
        fs.copyFileSync(file, path.join(requestedOutput, path.basename(file)));
      }
    }
    console.log(JSON.stringify({ version: first.manifest.version, ref: first.manifest.ref, sha256: first.sha256, reproducible, dryRun, output: dryRun ? null : requestedOutput }, null, 2));
  } finally {
    if (temporary) fs.rmSync(temporary, { recursive: true, force: true });
  }
}

module.exports = { MANIFEST_NAME, RELEASE_FILES_NAME, applyReleasePolicy, buildRelease, sha256 };
if (require.main === module) main();
