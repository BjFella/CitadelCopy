#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');
const { buildRelease, sanitizeReleaseInstructions, sha256 } = require('./release-package');
const { parseTar, verifyRelease } = require('./release-verify');

const ROOT = path.resolve(__dirname, '..');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function makeSource(root, version = '1.1.0') {
  writeJson(path.join(root, 'package.json'), { name: 'citadel', version, engines: { node: '>=18' } });
  writeJson(path.join(root, '.claude-plugin', 'plugin.json'), { name: 'citadel', version });
  writeJson(path.join(root, '.claude-plugin', 'marketplace.json'), { plugins: [{ name: 'citadel', version }] });
  writeJson(path.join(root, '.codex-plugin', 'plugin.json'), { name: 'citadel', version });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts', 'hello.js'), "console.log('citadel');\n");
  writeJson(path.join(root, 'release-files.json'), {
    schema: 1,
    includeFiles: ['package.json', 'release-files.json'],
    includeDirectories: ['.claude-plugin/', '.codex-plugin/', 'scripts/', '.planning/_templates/'],
    excludeFiles: [],
    excludeDirectories: [],
    excludePrefixes: [],
    excludeSegments: [],
  });
}

function writeOwnershipManifest(root, version, options = {}) {
  const omitted = new Set(options.omit || []);
  const files = [];
  const visit = (directory, prefix = '') => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (relative === '.citadel-release.json' || relative === '.citadel-backup.json' || relative.startsWith('.git/')) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute, relative);
      else if (entry.isFile() && !omitted.has(relative)) {
        const data = fs.readFileSync(absolute);
        files.push({ path: relative, bytes: data.length, sha256: sha256(data), mode: 0o644 });
      }
    }
  };
  visit(root);
  writeJson(path.join(root, '.citadel-release.json'), {
    schema: 1,
    version,
    ref: `v${version}`,
    commit: options.commit || '1'.repeat(40),
    createdAt: '2026-01-01T00:00:00.000Z',
    nodeRange: '>=18',
    runtimeMatrix: { operatingSystems: ['linux', 'macos', 'windows'], node: ['18', '20', '22'] },
    files: files.sort((left, right) => left.path.localeCompare(right.path)),
    rollbackCommand: 'node scripts/update.js --rollback <backup-path> --target <installation> --apply',
  });
}

function expectFailure(fn, pattern) {
  assert.throws(fn, pattern);
}

function sectionBody(content, startPattern, endPattern, label) {
  const start = content.search(startPattern);
  assert(start >= 0, `${label} is missing its start marker`);
  const afterStart = content.slice(start).replace(startPattern, '');
  const end = afterStart.search(endPattern);
  assert(end >= 0, `${label} is missing its end marker`);
  const body = afterStart.slice(0, end).trim();
  assert(body, `${label} must not be empty`);
  return body;
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-release-integrity-'));
try {
  assert.throws(
    () => sanitizeReleaseInstructions([
      { name: 'package.json', data: Buffer.from('{"version":"1.3.0"}') },
      {
        name: 'skills/kept/SKILL.md',
        data: Buffer.from('Preserve this required contract while using /omitted for an optional follow-up.\n'),
      },
    ], new Set(['kept', 'omitted'])),
    /Unhandled release instruction references:\s+skills\/kept\/SKILL\.md:1 \/omitted/,
    'release instruction projection must fail closed instead of deleting an unhandled mixed-purpose line',
  );

  const source = path.join(temp, 'source');
  makeSource(source);
  fs.mkdirSync(path.join(source, '.planning', '_templates'), { recursive: true });
  fs.mkdirSync(path.join(source, '.planning', 'campaigns'), { recursive: true });
  fs.writeFileSync(path.join(source, '.planning', '_templates', 'campaign.md'), 'distributable\n');
  fs.writeFileSync(path.join(source, '.planning', 'campaigns', 'private.md'), 'operational state\n');
  execFileSync('git', ['init'], { cwd: source, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.email', 'release-test@example.invalid'], { cwd: source, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.name', 'Citadel Release Test'], { cwd: source, stdio: 'pipe' });
  execFileSync('git', ['add', '.'], { cwd: source, stdio: 'pipe' });
  execFileSync('git', ['commit', '-m', 'release fixture'], {
    cwd: source,
    stdio: 'pipe',
    env: { ...process.env, GIT_AUTHOR_DATE: '2026-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z' },
  });
  execFileSync('git', ['tag', '-a', 'v1.1.0', '-m', 'Citadel v1.1.0'], {
    cwd: source,
    stdio: 'pipe',
    env: { ...process.env, GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z' },
  });
  const first = buildRelease({ sourceDir: source, outputDir: path.join(temp, 'one') });
  const second = buildRelease({ sourceDir: source, outputDir: path.join(temp, 'two') });
  assert.equal(first.sha256, second.sha256, 'same source must produce identical archives');
  assert.equal(fs.readFileSync(first.manifestPath, 'utf8'), fs.readFileSync(second.manifestPath, 'utf8'));

  const verified = verifyRelease(first.archivePath, { version: '1.1.0', ref: first.manifest.ref });
  assert.equal(verified.version, '1.1.0');
  assert(verified.files >= 5);
  assert(first.manifest.files.some((file) => file.path === '.planning/_templates/campaign.md'));
  assert(!first.manifest.files.some((file) => file.path === '.planning/campaigns/private.md'));
  const tagged = buildRelease({ sourceDir: source, ref: 'v1.1.0', outputDir: path.join(temp, 'tagged') });
  assert.equal(verifyRelease(tagged.archivePath, { version: '1.1.0', ref: 'v1.1.0' }).ref, 'v1.1.0');
  const tagObject = execFileSync('git', ['rev-parse', 'v1.1.0'], { cwd: source, encoding: 'utf8' }).trim();
  const sourceCommit = execFileSync('git', ['rev-parse', 'v1.1.0^{commit}'], { cwd: source, encoding: 'utf8' }).trim();
  assert.notEqual(tagObject, sourceCommit, 'fixture must use an annotated tag');
  assert.equal(tagged.manifest.commit, sourceCommit, 'release manifest must identify the peeled source commit');
  execFileSync('git', ['branch', 'v1.1.0'], { cwd: source, stdio: 'pipe' });
  expectFailure(() => buildRelease({ sourceDir: source, ref: 'refs/heads/v1.1.0', outputDir: path.join(temp, 'bad-ref') }), /does not match manifest version/);
  execFileSync('git', ['tag', 'vnext'], { cwd: source, stdio: 'pipe' });
  expectFailure(() => buildRelease({ sourceDir: source, ref: 'vnext', outputDir: path.join(temp, 'bad-label') }), /does not match manifest version/);
  execFileSync('git', ['tag', 'v9.9.9'], { cwd: source, stdio: 'pipe' });
  expectFailure(() => buildRelease({ sourceDir: source, ref: 'v9.9.9', outputDir: path.join(temp, 'bad-tag') }), /does not match manifest version/);
  expectFailure(() => verifyRelease(first.archivePath, { version: '9.9.9' }), /Expected version/);
  expectFailure(() => verifyRelease(first.archivePath, { ref: 'v9.9.9' }), /Expected ref/);

  const originalChecksum = fs.readFileSync(first.checksumPath);
  fs.writeFileSync(first.checksumPath, `${'0'.repeat(64)}  ${path.basename(first.archivePath)}\n`);
  expectFailure(() => verifyRelease(first.archivePath), /sidecar mismatch/);
  fs.writeFileSync(first.checksumPath, originalChecksum);

  const originalArchive = fs.readFileSync(first.archivePath);
  const corrupted = Buffer.from(originalArchive);
  corrupted[Math.floor(corrupted.length / 2)] ^= 0xff;
  fs.writeFileSync(first.archivePath, corrupted);
  const corruptHash = sha256(corrupted);
  fs.writeFileSync(first.checksumPath, `${corruptHash}  ${path.basename(first.archivePath)}\n`);
  const external = JSON.parse(fs.readFileSync(first.manifestPath, 'utf8'));
  external.artifact.sha256 = corruptHash;
  external.artifact.bytes = corrupted.length;
  fs.writeFileSync(first.manifestPath, `${JSON.stringify(external, null, 2)}\n`);
  expectFailure(() => verifyRelease(first.archivePath), /Invalid gzip|tar header|checksum mismatch|Truncated/);

  const updateRelease = buildRelease({ sourceDir: source, outputDir: path.join(temp, 'update-release') });
  const target = path.join(temp, 'installed-citadel');
  makeSource(target, '1.0.0');
  fs.writeFileSync(path.join(target, 'old-only.txt'), 'old\n');
  writeOwnershipManifest(target, '1.0.0');
  fs.writeFileSync(path.join(target, '.env'), 'CITADEL_USER_SECRET=preserve\n');
  fs.writeFileSync(path.join(target, 'operator-notes.txt'), 'user-owned notes\n');
  const updateScript = path.resolve(__dirname, 'update.js');
  const plan = JSON.parse(execFileSync(process.execPath, [updateScript, '--archive', updateRelease.archivePath, '--target', target], { encoding: 'utf8' }));
  assert.equal(plan.applied, false);
  assert.equal(readVersion(target), '1.0.0');
  assert(fs.existsSync(path.join(target, 'old-only.txt')), 'plan-only update must not mutate target');

  const applied = JSON.parse(execFileSync(process.execPath, [updateScript, '--archive', updateRelease.archivePath, '--target', target, '--apply'], { encoding: 'utf8' }));
  assert.equal(applied.applied, true);
  assert.equal(readVersion(target), '1.1.0');
  assert(!fs.existsSync(path.join(target, 'old-only.txt')), 'apply should replace stale release files');
  assert.equal(fs.readFileSync(path.join(target, '.env'), 'utf8'), 'CITADEL_USER_SECRET=preserve\n');
  assert.equal(fs.readFileSync(path.join(target, 'operator-notes.txt'), 'utf8'), 'user-owned notes\n');
  assert(fs.existsSync(path.join(target, '.citadel-release.json')), 'update must retain embedded ownership metadata');
  assert(fs.existsSync(applied.backupPath));
  assert(fs.existsSync(path.join(applied.backupPath, '.citadel-backup.json')), 'backup must carry a bound integrity receipt');

  const conflictTarget = path.join(temp, 'conflict-citadel');
  makeSource(conflictTarget, '1.0.0');
  writeOwnershipManifest(conflictTarget, '1.0.0', { omit: ['scripts/hello.js'] });
  fs.writeFileSync(path.join(conflictTarget, 'scripts', 'hello.js'), 'user-owned conflict\n');
  expectFailure(() => execFileSync(process.execPath, [
    updateScript, '--archive', updateRelease.archivePath, '--target', conflictTarget, '--apply',
  ], { encoding: 'utf8', stdio: 'pipe' }), /unowned path conflict/i);
  assert.equal(fs.readFileSync(path.join(conflictTarget, 'scripts', 'hello.js'), 'utf8'), 'user-owned conflict\n');

  const wrongTarget = path.join(temp, 'wrong-citadel');
  makeSource(wrongTarget, '1.1.0');
  writeOwnershipManifest(wrongTarget, '1.1.0');
  expectFailure(() => execFileSync(process.execPath, [
    updateScript, '--rollback', applied.backupPath, '--target', wrongTarget,
  ], { encoding: 'utf8', stdio: 'pipe' }), /target binding/i);

  const backupPackage = path.join(applied.backupPath, 'package.json');
  const pristineBackupPackage = fs.readFileSync(backupPackage);
  fs.appendFileSync(backupPackage, '\n');
  expectFailure(() => execFileSync(process.execPath, [
    updateScript, '--rollback', applied.backupPath, '--target', target,
  ], { encoding: 'utf8', stdio: 'pipe' }), /backup content digest/i);
  fs.writeFileSync(backupPackage, pristineBackupPackage);

  const rollbackPlan = JSON.parse(execFileSync(process.execPath, [updateScript, '--rollback', applied.backupPath, '--target', target], { encoding: 'utf8' }));
  assert.equal(rollbackPlan.applied, false);
  assert.equal(readVersion(target), '1.1.0');
  fs.writeFileSync(path.join(target, 'after-update-note.txt'), 'created after update\n');
  execFileSync(process.execPath, [updateScript, '--rollback', applied.backupPath, '--target', target, '--apply'], { stdio: 'pipe' });
  assert.equal(readVersion(target), '1.0.0');
  assert(fs.existsSync(path.join(target, 'old-only.txt')), 'rollback should restore prior release files');
  assert.equal(fs.readFileSync(path.join(target, '.env'), 'utf8'), 'CITADEL_USER_SECRET=preserve\n');
  assert.equal(fs.readFileSync(path.join(target, 'operator-notes.txt'), 'utf8'), 'user-owned notes\n');
  assert.equal(fs.readFileSync(path.join(target, 'after-update-note.txt'), 'utf8'), 'created after update\n');

  const product = buildRelease({ sourceDir: ROOT, outputDir: path.join(temp, 'product') });
  const productPaths = new Set(product.manifest.files.map((file) => file.path));
  for (const required of [
    'release-files.json', 'package.json', 'bin/citadel.js',
    'scripts/install.js', 'scripts/adopt.js', 'scripts/update.js', 'scripts/unharness.js',
    'core/cli/package-cli.js', 'runtimes/codex/hooks.json', 'runtimes/claude-code/runtime.js',
    'core/skills/routing.js', 'core/skills/routing-table.json', 'scripts/route-preview.js',
    'skills/do/SKILL.md', 'hooks_src/init-project.js', 'docs/CLI.md', 'docs/RELEASES.md',
  ]) assert(productPaths.has(required), `release allowlist omitted runtime path: ${required}`);
  for (const forbidden of productPaths) {
    assert(!forbidden.startsWith('benchmarks/'), `release leaked benchmark content: ${forbidden}`);
    assert(!forbidden.startsWith('.planning/research/'), `release leaked research content: ${forbidden}`);
    assert(!forbidden.startsWith('docs/grants/'), `release leaked grant content: ${forbidden}`);
    assert(!forbidden.startsWith('packages/'), `release leaked quarantined package: ${forbidden}`);
    assert(!forbidden.startsWith('packs/'), `release leaked experimental pack: ${forbidden}`);
    assert(!forbidden.startsWith('workflows/'), `release leaked internal workflow: ${forbidden}`);
    assert(!forbidden.startsWith('mcp-servers/codebase-memory/'), `release leaked non-runtime MCP server: ${forbidden}`);
    assert(!forbidden.startsWith('scripts/test-'), `release leaked test program: ${forbidden}`);
    assert(!forbidden.includes('/__benchmarks__/'), `release leaked skill benchmark: ${forbidden}`);
    assert(!forbidden.split('/').includes('fixtures'), `release leaked fixture content: ${forbidden}`);
  }
  for (const forbidden of [
    'assets/social-preview.png', 'docs/index.html', 'hooks_src/smoke-test.js',
    'agents/knowledge-extractor.md', 'mcp-servers/citadel-state/README.md',
    'docs/DAEMON.md', 'docs/FLEET.md', 'docs/GOVERNED_LIFECYCLE.md', 'docs/OPERATION_CONTROL.md',
    'mcp-servers/codebase-memory/smoke-test.js', 'core/team/pilot.js',
    'core/telemetry/activation-cohort.js', 'core/telemetry/github-traffic.js',
    'scripts/check-sentient-grant-form.js', 'scripts/github-traffic-snapshot.js',
    'scripts/render-sentient-grant-packet.py', 'scripts/capture-application-media.js',
  ]) assert(!productPaths.has(forbidden), `release leaked lab or maintainer-only content: ${forbidden}`);
  assert(![...productPaths].some((relative) => relative.startsWith('.planning/rubrics/')), 'release leaked maintainer-only rubrics');
  assert.equal(verifyRelease(product.archivePath, { version: '1.3.0', ref: product.manifest.ref }).files, productPaths.size);

  const extracted = path.join(temp, 'product-extracted');
  const archiveFiles = parseTar(zlib.gunzipSync(fs.readFileSync(product.archivePath)));
  for (const [name, data] of archiveFiles) {
    const destination = path.join(extracted, ...name.split('/'));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, data);
  }
  const productRoot = path.join(extracted, `citadel-${product.manifest.version}`);
  const productBin = path.join(productRoot, 'bin', 'citadel.js');
  const cliHelp = execFileSync(process.execPath, [productBin, '--help'], { cwd: productRoot, encoding: 'utf8' });
  const cliCommands = new Set([...cliHelp.matchAll(/^  ([a-z][a-z-]+)\s+/gm)].map((match) => match[1]));
  for (const relative of ['README.md', 'INSTALL.md', 'docs/CLI.md']) {
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    for (const match of content.matchAll(/\bcitadel\s+([a-z][a-z-]*)\b/g)) {
      assert(cliCommands.has(match[1]), `${relative} advertises unsupported packaged CLI command: citadel ${match[1]}`);
    }
  }
  for (const relative of [...productPaths].filter((item) => /^skills\/[^/]+\/SKILL\.md$/.test(item))) {
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    for (const match of content.matchAll(/\bnode\s+(?:\{[^}]+\}\/)?((?:scripts|hooks_src)\/[A-Za-z0-9._/-]+)/g)) {
      assert(productPaths.has(match[1]), `${relative} invokes omitted runtime target: ${match[1]}`);
    }
    for (const match of content.matchAll(/\bcitadel\s+([a-z][a-z-]*)\b/g)) {
      assert(cliCommands.has(match[1]), `${relative} advertises unsupported packaged CLI command: citadel ${match[1]}`);
    }
  }
  const releaseRouting = JSON.parse(fs.readFileSync(path.join(productRoot, 'core', 'skills', 'routing-table.json'), 'utf8'));
  for (const skill of releaseRouting.skills) {
    assert(productPaths.has(`skills/${skill.name}/SKILL.md`), `release routing suggests omitted skill /${skill.name}`);
  }
  const releaseDo = fs.readFileSync(path.join(productRoot, 'skills', 'do', 'SKILL.md'), 'utf8');
  for (const match of releaseDo.matchAll(/\| `\/([a-z0-9-]+)/g)) {
    assert(productPaths.has(`skills/${match[1]}/SKILL.md`), `release /do table suggests omitted skill /${match[1]}`);
  }
  for (const match of releaseDo.matchAll(/`\/([a-z][a-z0-9-]*)(?=[\s`{])/g)) {
    if (['name', 'skill'].includes(match[1])) continue;
    assert(productPaths.has(`skills/${match[1]}/SKILL.md`), `release /do routes to omitted skill /${match[1]}`);
  }

  const createAppSkill = fs.readFileSync(path.join(productRoot, 'skills', 'create-app', 'SKILL.md'), 'utf8');
  const createAppVerify = sectionBody(
    createAppSkill,
    /### Step 3: VERIFY \(All Tiers except 1\)\r?\n/,
    /### Step 4: DELIVER/,
    'release create-app Step 3 VERIFY contract',
  );
  assert.match(createAppVerify, /each PRD end condition/i, 'release create-app must preserve PRD end-condition verification');
  assert.match(createAppVerify, /PASS \/ PARTIAL \/ FAIL/, 'release create-app must preserve explicit verification outcomes');
  assert.match(createAppVerify, /visual/i, 'release create-app must preserve visual-check semantics');

  const experimentSkill = fs.readFileSync(path.join(productRoot, 'skills', 'experiment', 'SKILL.md'), 'utf8');
  const experimentTrust = sectionBody(
    experimentSkill,
    /\*\*Trust gates:\*\*\r?\n/,
    /## Quality Gates/,
    'release experiment Trust gates contract',
  );
  assert.match(experimentTrust, /novice/i, 'release experiment must preserve novice trust guidance');
  assert.match(experimentTrust, /manual review/i, 'release experiment must preserve its manual-review boundary');
  assert.match(experimentTrust, /Familiar \(5\+ sessions\)/, 'release experiment must preserve its familiar-user threshold');
  assert.match(experimentTrust, /iterates and commits autonomously/i, 'release experiment must preserve its autonomous-commit disclosure');

  for (const relative of [...productPaths].filter((item) => /^skills\/[^/]+\/SKILL\.md$/.test(item))) {
    const sourceContent = fs.readFileSync(path.join(ROOT, ...relative.split('/')), 'utf8');
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    for (const sourceMarker of sourceContent.matchAll(/^\*\*Trust gates:\*\*[ \t]*$/gm)) {
      assert(sourceMarker, `${relative} source trust marker could not be read`);
      const marker = /^\*\*Trust gates:\*\*[ \t]*$/m.exec(content);
      assert(marker, `${relative} omitted its Trust gates marker`);
      const tail = content.slice(marker.index + marker[0].length).replace(/^\r?\n/, '');
      const boundary = tail.search(/^#{1,6}\s/m);
      const body = (boundary >= 0 ? tail.slice(0, boundary) : tail).trim();
      assert(body, `${relative} has an empty Trust gates section`);
    }
  }

  const postmortemSkill = fs.readFileSync(path.join(productRoot, 'skills', 'postmortem', 'SKILL.md'), 'utf8');
  const postmortemHandoff = sectionBody(
    postmortemSkill,
    /### Step 4: HANDOFF\r?\n/,
    /## What \/postmortem Does NOT Do/,
    'release postmortem Step 4 HANDOFF contract',
  );
  assert.match(postmortemHandoff, /HANDOFF block/i, 'release postmortem must preserve its HANDOFF action');

  const archonSkill = fs.readFileSync(path.join(productRoot, 'skills', 'archon', 'SKILL.md'), 'utf8');
  const archonExecution = sectionBody(
    archonSkill,
    /### Step 3: EXECUTE PHASES\r?\n/,
    /### Step 4: SELF-CORRECTION/,
    'release Archon execution contract',
  );
  assert.match(archonExecution, /visual_verify/, 'release Archon must retain visual_verify execution');
  assert.match(archonExecution, /visual verifier|visual evidence/i, 'release Archon must retain executable visual-evidence semantics');
  assert.match(archonExecution, /blocked\/HUMAN_INPUT_REQUIRED/, 'release Archon must block when visual verification is unavailable');
  const archonSpotCheck = sectionBody(
    archonSkill,
    /#### Quality Spot-Check \(every phase\)\r?\n/,
    /#### Regression Guard/,
    'release Archon quality spot-check contract',
  );
  for (const pattern of [/view files/i, /visual verifier|visual evidence/i, /below bar/i]) {
    assert.match(archonSpotCheck, pattern, `release Archon spot-check lost required semantics: ${pattern}`);
  }

  const dashboardSkill = fs.readFileSync(path.join(productRoot, 'skills', 'dashboard', 'SKILL.md'), 'utf8');
  const dashboardHookPolicy = sectionBody(
    dashboardSkill,
    /\*\*Hook Problem Taxonomy:\*\*\r?\n/,
    /\*\*Health:\*\*/,
    'release dashboard hook-problem policy',
  );
  assert.match(dashboardHookPolicy, /repair action should appear only when actionable entries are\s+present/i);
  assert.match(dashboardHookPolicy, /Safety blocks remain visible/i);
  const dashboardFringe = sectionBody(
    dashboardSkill,
    /### Step 4: FRINGE CASE HANDLING\r?\n/,
    /## Contextual Gates/,
    'release dashboard fringe-case policy',
  );
  assert.match(dashboardFringe, /Only safety blocks recorded/i);
  assert.match(dashboardFringe, /Actionable hook problem recorded/i);
  assert.match(dashboardFringe, /node scripts\/dashboard\.js --json/);
  assert.match(dashboardFringe, /node hooks_src\/doc-sync\.js --project-root \./, 'release dashboard must retain its shipped doc-sync repair command');

  const setupSkill = fs.readFileSync(path.join(productRoot, 'skills', 'setup', 'SKILL.md'), 'utf8');
  const setupWalkthrough = sectionBody(
    setupSkill,
    /### Step 7: FULL TOUR WALKTHROUGH \(Full Tour only\)\r?\n/,
    /### Step 8: REFERENCE CARD/,
    'release setup walkthrough contract',
  );
  for (const pattern of [/5\. \*\*Observability\*\*/, /\/do next/, /\/dashboard/, /\/cost/]) {
    assert.match(setupWalkthrough, pattern, `release setup walkthrough lost required semantics: ${pattern}`);
  }
  const setupReferenceCard = sectionBody(
    setupSkill,
    /### Step 8: REFERENCE CARD \(all modes\)\r?\n/,
    /### Step 9: CLOSING LINE/,
    'release setup reference-card contract',
  );
  for (const pattern of [/NEXT STEPS/, /CLAUDE\.md/, /\/do --list/, /\/create-skill/]) {
    assert.match(setupReferenceCard, pattern, `release setup reference card lost required semantics: ${pattern}`);
  }

  const orientationContracts = new Map([
    ['skills/merge-review/SKILL.md', [/general code quality/i, /\/review/, /CI status/i]],
    ['skills/postmortem/SKILL.md', [/session context/i, /\/session-handoff/, /reusable patterns/i, /iterative quality/i]],
    ['skills/review/SKILL.md', [/generating tests/i, /\/test-gen/, /security audit/i, /skill file review/i]],
    ['skills/session-handoff/SKILL.md', [/reusable patterns/i, /\/postmortem/, /documentation/i]],
    ['skills/setup/SKILL.md', [/already configured/i, /adding a single skill/i, /copy SKILL\.md manually/i]],
    ['skills/test-gen/SKILL.md', [/tests already exist/i, /\/review/, /integration tests across services/i, /\/marshal/]],
    ['skills/wiki/SKILL.md', [/session learnings/i, /structured code documentation/i, /\/doc-gen/]],
  ]);
  for (const [relative, patterns] of orientationContracts) {
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    const orientation = /^\*\*Don't use when:\*\*.*$/m.exec(content);
    assert(orientation, `${relative} omitted its Don't use when orientation`);
    for (const pattern of patterns) assert.match(orientation[0], pattern, `${relative} orientation lost required semantics: ${pattern}`);
  }
  const housecleanSkill = fs.readFileSync(path.join(productRoot, 'skills', 'houseclean', 'SKILL.md'), 'utf8');
  assert.match(housecleanSkill, /monthly manual check/i, 'release houseclean must retain monthly-check guidance');

  const releaseMetadata = JSON.parse(fs.readFileSync(path.join(productRoot, 'citadel-metadata.json'), 'utf8'));
  const shippedSkillCount = [...productPaths].filter((relative) => /^skills\/[^/]+\/SKILL\.md$/.test(relative)).length;
  assert.equal(releaseMetadata.skills.count, shippedSkillCount, 'release metadata skill count must match the archive');
  let generatedSkillCountMarkers = 0;
  for (const relative of [...productPaths].filter((item) => /\.(?:html|json|md|svg|txt)$/i.test(item))) {
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    for (const match of content.matchAll(/<!-- GENERATED: skill-count -->(\d+)<!-- \/GENERATED -->/g)) {
      generatedSkillCountMarkers += 1;
      assert.equal(Number(match[1]), shippedSkillCount, `${relative} generated skill count must match the archive`);
    }
  }
  assert(generatedSkillCountMarkers >= 2, 'release must retain and project its public generated skill-count surfaces');
  for (const link of releaseMetadata.proof_links) {
    const target = String(link).split('#')[0];
    assert(productPaths.has(target), `release metadata links omitted archive path: ${link}`);
  }
  assert.deepEqual(releaseMetadata.interoperability, { remote_registry_verification: 'not-claimed' });
  const releaseCodexManifest = JSON.parse(fs.readFileSync(path.join(productRoot, '.codex-plugin', 'plugin.json'), 'utf8'));
  assert(!/\b49 skills\b|PR triage/i.test(JSON.stringify(releaseCodexManifest)), 'release Codex metadata overstates excluded surfaces');

  const publicMarkdown = [...productPaths].filter((relative) => (
    relative === 'README.md' || relative === 'INSTALL.md' || relative === 'CHANGELOG.md'
      || relative === 'PRIVACY.md' || relative === 'SECURITY.md' || /^docs\/[^/]+\.md$/.test(relative)
  ));
  for (const relative of publicMarkdown) {
    const absolute = path.join(productRoot, ...relative.split('/'));
    const content = fs.readFileSync(absolute, 'utf8');
    const rawTargets = [
      ...[...content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]),
      ...[...content.matchAll(/<(?:img|a)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]),
    ];
    for (let raw of rawTargets) {
      raw = raw.trim();
      if (raw.startsWith('<')) raw = raw.slice(1, raw.indexOf('>'));
      else raw = raw.split(/\s+["']/)[0];
      if (!raw || /^(?:https?:|mailto:|#)/i.test(raw)) continue;
      const local = decodeURIComponent(raw.split('#')[0].split('?')[0]);
      if (!local) continue;
      const resolved = path.resolve(path.dirname(absolute), ...local.replace(/\\/g, '/').split('/'));
      assert(fs.existsSync(resolved), `${relative} links omitted archive-local path: ${raw}`);
    }
  }

  const releasePackage = JSON.parse(fs.readFileSync(path.join(productRoot, 'package.json'), 'utf8'));
  const releaseChangelog = fs.readFileSync(path.join(productRoot, 'CHANGELOG.md'), 'utf8');
  assert(releaseChangelog.includes(`## ${releasePackage.version}`));
  assert(!releaseChangelog.includes(`## ${releasePackage.version} - Unreleased`));
  assert.equal(releasePackage.private, true);
  assert(!releasePackage.files && !releasePackage.maintainerFiles && !releasePackage.maintainerScripts);
  assert.deepEqual(Object.keys(releasePackage.scripts).sort(), [
    'citadel:install', 'claude:install', 'codex:install', 'release:verify', 'update',
  ]);
  assert.deepEqual(releasePackage.citadelRelease.lifecycleCommands, ['install', 'doctor', 'update', 'rollback', 'uninstall']);
  for (const [name, command] of Object.entries(releasePackage.scripts)) {
    const match = /^node\s+([^\s]+\.js)(?:\s|$)/.exec(command);
    assert(match, `release package script ${name} is not a single Node target`);
    assert(fs.existsSync(path.join(productRoot, ...match[1].split('/'))), `release package script ${name} targets omitted file ${match[1]}`);
  }
  for (const target of Object.values(releasePackage.bin)) {
    assert(fs.existsSync(path.join(productRoot, ...target.split('/'))), `release package bin targets omitted file ${target}`);
  }
  const releasePackageScripts = new Set(Object.keys(releasePackage.scripts));
  const sourceSkillNames = new Set(fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name));
  const shippedSkillNames = new Set([...productPaths]
    .map((relative) => /^skills\/([^/]+)\/SKILL\.md$/.exec(relative)?.[1])
    .filter(Boolean));
  const targetProjectNpmCommands = new Map([
    ['.planning/_templates/campaign.md', new Set(['test'])],
    ['.planning/_templates/deploy/static.md', new Set(['start'])],
    ['docs/ARCHITECTURE.md', new Set(['test'])],
    ['skills/do/SKILL.md', new Set(['test', 'build', 'typecheck'])],
    ['skills/experiment/SKILL.md', new Set(['test', 'build'])],
    ['skills/map/SKILL.md', new Set(['test', 'typecheck'])],
    ['skills/refactor/SKILL.md', new Set(['typecheck'])],
    ['skills/setup/SKILL.md', new Set(['test'])],
  ]);
  const releaseInstructionMarkdown = [...productPaths].filter((item) => item.endsWith('.md'));
  for (const relative of releaseInstructionMarkdown) {
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      for (const match of line.matchAll(/\/([a-z][a-z0-9-]*)\b/g)) {
        const before = match.index === 0 ? '' : line[match.index - 1];
        if (match.index !== 0 && !/[\s`"'(]/.test(before)) continue;
        if (!sourceSkillNames.has(match[1])) continue;
        assert(shippedSkillNames.has(match[1]), `${relative} references omitted release route /${match[1]}`);
      }
      for (const match of line.matchAll(/\bnode\s+(?:["']?(?:\$[A-Za-z_:]+|\{[^}]+\})[\\/])?((?:scripts|hooks_src)[\\/][A-Za-z0-9._/-]+)/g)) {
        const program = match[1].replace(/\\/g, '/');
        assert(productPaths.has(program), `${relative} invokes omitted release program ${program}`);
      }
      for (const match of line.matchAll(/\bnpm\s+(?:run\s+([A-Za-z0-9:_-]+)|test\b)/g)) {
        const script = match[1] || 'test';
        if (targetProjectNpmCommands.get(relative)?.has(script)) continue;
        assert(releasePackageScripts.has(script), `${relative} invokes omitted release package script ${script}`);
      }
      for (const match of line.matchAll(/\.citadel[\\/]scripts[\\/]([A-Za-z0-9._-]+\.(?:c?js))/g)) {
        const delegate = `scripts/${match[1]}`;
        assert(productPaths.has(delegate), `${relative} delegates to omitted packaged program ${delegate}`);
      }
      for (const match of line.matchAll(/\bcitadel\s+([a-z][a-z-]*)\b/g)) {
        assert(cliCommands.has(match[1]), `${relative} advertises unsupported packaged CLI command: citadel ${match[1]}`);
      }
    }
    if (sourceSkillNames.has('daemon') && !shippedSkillNames.has('daemon')) {
      assert(!/\bdaemon\b/i.test(content), `${relative} retains daemon instructions although /daemon is omitted`);
    }
  }

  const runtimeInstructionFiles = [
    'core/codex/native-integrations.js',
    'core/project/render-codex-guidance.js',
    'core/verification/profiles.js',
    'hooks_src/init-project.js',
    'hooks_src/intake-scanner.js',
    'hooks_src/issue-monitor.js',
    'mcp-servers/citadel-state/index.js',
    'scripts/dashboard.js',
    'scripts/next-action.js',
    'scripts/operator-console.js',
    'scripts/repository-memory.js',
    'scripts/stack-plan.js',
  ];
  const targetProjectRuntimeNpmCommands = new Map([
    ['core/verification/profiles.js', new Set(['test'])],
    ['scripts/stack-plan.js', new Set(['test'])],
  ]);
  for (const relative of runtimeInstructionFiles) {
    const content = fs.readFileSync(path.join(productRoot, ...relative.split('/')), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      for (const match of line.matchAll(/\/([a-z][a-z0-9-]*)\b/g)) {
        const before = match.index === 0 ? '' : line[match.index - 1];
        if (match.index !== 0 && !/[\s`"'(]/.test(before)) continue;
        if (!sourceSkillNames.has(match[1])) continue;
        assert(shippedSkillNames.has(match[1]), `${relative} can emit omitted release route /${match[1]}`);
      }
      for (const match of line.matchAll(/\bnpm\s+(?:run\s+([A-Za-z0-9:_-]+)|test\b)/g)) {
        const script = match[1] || 'test';
        if (targetProjectRuntimeNpmCommands.get(relative)?.has(script)) continue;
        assert(releasePackageScripts.has(script), `${relative} can emit omitted release package script ${script}`);
      }
      for (const match of line.matchAll(/\bnode\s+((?:scripts|hooks_src)[\\/][A-Za-z0-9._/-]+)/g)) {
        const program = match[1].replace(/\\/g, '/');
        assert(productPaths.has(program), `${relative} can emit omitted release program ${program}`);
      }
      for (const match of line.matchAll(/\bcitadel\s+([a-z][a-z-]*)\b/g)) {
        assert(cliCommands.has(match[1]), `${relative} can emit unsupported packaged CLI command: citadel ${match[1]}`);
      }
      for (const match of line.matchAll(/\.citadel[\\/]scripts[\\/]([A-Za-z0-9._-]+\.(?:c?js))/g)) {
        const delegate = `scripts/${match[1]}`;
        assert(productPaths.has(delegate), `${relative} can emit a delegate for omitted packaged program ${delegate}`);
      }
    }
  }

  const releaseStackPlan = require(path.join(productRoot, 'scripts', 'stack-plan.js'));
  const stackRunbook = releaseStackPlan.buildPostApprovalRunbook('approval-needed', [{ pr: 'https://example.invalid/pr/1', status: 'ready' }]);
  assert.match(JSON.stringify(stackRunbook), /node scripts\/stack-plan\.js/);
  assert.doesNotMatch(JSON.stringify(stackRunbook), /npm run stack:plan/);
  const releaseOperator = require(path.join(productRoot, 'scripts', 'operator-console.js'));
  const stackBoundary = releaseOperator.boundaryForStack({ status: 'blocked' });
  assert.match(JSON.stringify(stackBoundary), /node scripts\/stack-plan\.js/);
  assert.doesNotMatch(JSON.stringify(stackBoundary), /npm run stack:plan/);
  const releaseProfiles = require(path.join(productRoot, 'core', 'verification', 'profiles.js'));
  assert.equal(releaseProfiles.profileForFiles(['src/example.js'], {}).primaryCommand, 'git diff --check');
  assert.equal(releaseProfiles.profileForFiles(['src/example.js'], { test: 'vitest' }).primaryCommand, 'npm run test');

  const mcpProbe = [
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'release-test', version: '1' } } }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
    '',
  ].join('\n');
  const mcpOutput = execFileSync(process.execPath, [path.join(productRoot, 'mcp-servers', 'citadel-state', 'index.js')], {
    cwd: productRoot,
    encoding: 'utf8',
    input: mcpProbe,
  }).trim().split(/\r?\n/).map((line) => JSON.parse(line));
  const workflowTool = mcpOutput.find((response) => response.id === 2).result.tools
    .find((tool) => tool.name === 'citadel_workflow_prompt');
  assert.deepEqual(new Set(workflowTool.inputSchema.properties.workflow.enum), shippedSkillNames);
  const releaseMcp = JSON.parse(fs.readFileSync(path.join(productRoot, '.mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(releaseMcp.mcpServers), ['citadel-state']);
  for (const [name, server] of Object.entries(releaseMcp.mcpServers)) {
    assert.equal(server.command, 'node', `release MCP ${name} must use the packaged Node runtime target`);
    const target = server.args?.[0];
    assert(target && fs.existsSync(path.join(productRoot, ...target.split('/'))), `release MCP ${name} targets omitted file ${target}`);
  }

  for (const relative of productPaths) {
    if (!/\.(?:c?js)$/.test(relative)) continue;
    const absolute = path.join(productRoot, ...relative.split('/'));
    const sourceText = fs.readFileSync(absolute, 'utf8');
    const executableText = sourceText.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
    const imports = [...executableText.matchAll(/^[ \t]*(?:[^\"'`\r\n]*=\s*|return\s+)?require\(\s*(['"])(\.[^'"]+)\1\s*\)/gm)].map((match) => match[2]);
    for (const request of imports) {
      const base = path.resolve(path.dirname(absolute), request);
      const candidates = [base, `${base}.js`, `${base}.cjs`, `${base}.json`, path.join(base, 'index.js')];
      assert(candidates.some((candidate) => fs.existsSync(candidate)), `${relative} requires omitted module ${request}`);
    }
    for (const match of executableText.matchAll(/path\.(?:join|resolve)\(\s*__dirname\s*,\s*['"]([^'"]+\.(?:c?js))['"]\s*\)/g)) {
      const sibling = path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1].replace(/\\/g, '/')));
      assert(productPaths.has(sibling), `${relative} resolves omitted executable sibling ${sibling}`);
    }
  }

  const codexManifest = JSON.parse(fs.readFileSync(path.join(productRoot, '.codex-plugin', 'plugin.json'), 'utf8'));
  for (const asset of [codexManifest.interface?.composerIcon, codexManifest.interface?.logo].filter(Boolean)) {
    const relative = asset.replace(/^\.\//, '');
    assert(fs.existsSync(path.join(productRoot, ...relative.split('/'))), `Codex plugin references omitted asset ${asset}`);
  }
  assert(!JSON.stringify(codexManifest).includes('social-preview'), 'Codex plugin must not reference excluded site media');

  const routeScript = path.join(productRoot, 'scripts', 'route-preview.js');
  const exactRoute = JSON.parse(execFileSync(process.execPath, [
    routeScript, '--json', '--', 'what should I do next',
  ], { cwd: productRoot, encoding: 'utf8' }));
  assert.equal(exactRoute.selected, '/do next');
  assert.equal(exactRoute.command, 'node scripts/operator-console.js --run');
  const semanticRoute = JSON.parse(execFileSync(process.execPath, [
    routeScript, '--json', '--', 'review auth module',
  ], { cwd: productRoot, encoding: 'utf8' }));
  assert.equal(semanticRoute.selected, null);
  assert.equal(semanticRoute.suggestedRoute, '/review');
  assert.equal(semanticRoute.boundary, 'semantic-classification-required');

  for (const command of ['install', 'update', 'rollback', 'uninstall']) {
    const help = execFileSync(process.execPath, [productBin, command, '--help'], { cwd: productRoot, encoding: 'utf8' });
    assert.match(help, /Usage:/, `release artifact ${command} help is not runnable`);
  }
  const dryRunTarget = path.join(temp, 'release-install-target');
  fs.mkdirSync(dryRunTarget, { recursive: true });
  const install = JSON.parse(execFileSync(process.execPath, [
    productBin, 'install', '--runtime', 'codex', '--project-root', dryRunTarget,
    '--plugin-only', '--dry-run', '--json',
  ], { cwd: productRoot, encoding: 'utf8' }));
  assert.equal(install.mode, 'plugin-only');
  assert(install.steps.every((step) => step.skipped), 'release artifact install dry-run must not execute steps');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log('release integrity tests passed');

function readVersion(directory) {
  return JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')).version;
}
