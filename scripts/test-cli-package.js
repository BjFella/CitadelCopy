#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const cli = require('../core/cli/package-cli');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'citadel.js');

function invoke(args, cwd = ROOT) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function tarEntries(buffer) {
  const result = [];
  for (let offset = 0; offset + 512 <= buffer.length;) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const text = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/, '');
    const name = [text(345, 155), text(0, 100)].filter(Boolean).join('/');
    const mode = Number.parseInt(text(100, 8).trim() || '0', 8);
    const size = Number.parseInt(text(124, 12).trim() || '0', 8);
    result.push({ name, mode, size });
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return result;
}

function captureIo() {
  const output = { stdout: '', stderr: '' };
  return {
    output,
    io: {
      stdout: { write: (value) => { output.stdout += value; } },
      stderr: { write: (value) => { output.stderr += value; } },
    },
  };
}

const manifest = require('../package.json');
assert.equal(manifest.private, true, 'root package must not claim an unowned public npm namespace');
assert.deepEqual(manifest.bin, { citadel: 'bin/citadel.js' });
assert(manifest.files.includes('bin/'));
assert(manifest.files.includes('core/cli/'));
assert(manifest.files.includes('.planning/_templates/'));
assert(!manifest.files.includes('.planning/'), 'operational planning state must not be published wholesale');
for (const forbidden of ['core/', 'dashboard/', 'mcp-servers/', 'packages/', 'packs/', 'scripts/', 'workflows/']) {
  assert(!manifest.files.includes(forbidden), `package must not publish ${forbidden} wholesale`);
}
assert(!manifest.files.includes('commands/'), 'package allowlist must not contain the removed commands/ surface');
for (const entry of manifest.files) {
  if (entry.startsWith('!')) continue;
  assert(fs.existsSync(path.join(ROOT, entry)), `package allowlist entry does not exist: ${entry}`);
}
assert(Object.keys(manifest.scripts).length >= 180, 'source package must preserve maintainer command surface');
for (const required of ['test', 'release:dry-run', 'daemon:local', 'control-plane:stdio', 'benchmark:validate']) {
  assert(manifest.scripts[required], `source package lost maintainer command ${required}`);
}
assert(!manifest.maintainerScripts, 'source maintainer commands must remain executable npm scripts');
const contractsManifest = require('../packages/contracts/package.json');
assert.equal(contractsManifest.private, true, 'nested contracts package must not claim an unowned public namespace');
assert(!contractsManifest.publishConfig, 'nested contracts package must not retain public publish configuration');

const markerFreeFs = { existsSync: () => false };
assert.deepEqual(cli.detectRuntime(['--runtime', 'claude']), { runtime: 'claude', source: 'argument' });
assert.deepEqual(cli.detectRuntime([], { env: { CITADEL_RUNTIME: 'codex' } }), { runtime: 'codex', source: 'environment' });
assert.deepEqual(cli.detectRuntime([], { env: {}, fsImpl: markerFreeFs, probe: (command) => command === 'claude' }), { runtime: 'claude', source: 'command' });
assert.throws(() => cli.detectRuntime([], { env: {}, fsImpl: markerFreeFs, probe: () => true }), (error) => error.code === cli.CODE.RUNTIME_AMBIGUOUS);
assert.throws(() => cli.detectRuntime([], { env: {}, fsImpl: markerFreeFs, probe: () => false }), (error) => error.code === cli.CODE.RUNTIME_NOT_FOUND);

const markerRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-cli-marker-'));
fs.mkdirSync(path.join(markerRoot, '.codex'));
assert.deepEqual(cli.detectRuntime(['--project-root', markerRoot], { env: {}, probe: () => false }), { runtime: 'codex', source: 'project-marker' });

const help = invoke(['--help']);
assert.equal(help.status, 0, help.stderr);
for (const command of ['install', 'doctor', 'update', 'rollback', 'uninstall']) {
  assert(help.stdout.includes(command), `root help missing ${command}`);
}
for (const command of ['pack', 'journey', 'receipt', 'fork', 'adopt', 'config', 'governance', 'control-plane', 'trial', 'memory', 'operation']) {
  assert(!new RegExp(`\\n  ${command}\\s`).test(help.stdout), `root help leaked unsupported command ${command}`);
  assert.notEqual(invoke([command, '--help']).status, 0, `unsupported command ${command} must fail closed`);
}

const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-cli-install & literal-'));
const install = invoke(['install', '--runtime', 'codex', '--project-root', installRoot, '--plugin-only', '--dry-run', '--json']);
assert.equal(install.status, 0, install.stderr);
const installReport = JSON.parse(install.stdout);
assert.equal(path.resolve(installReport.projectRoot), path.resolve(installRoot));
assert.equal(installReport.mode, 'plugin-only');
assert(installReport.steps.every((step) => step.skipped), 'dry-run installer must not execute a step');

const autoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-cli-auto-'));
fs.mkdirSync(path.join(autoRoot, '.codex'));
const automatic = invoke(['install', '--project-root', autoRoot, '--plugin-only', '--dry-run', '--json']);
assert.equal(automatic.status, 0, automatic.stderr);
assert.equal(JSON.parse(automatic.stdout).mode, 'plugin-only');

const uninstallRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-cli-uninstall-'));
fs.mkdirSync(path.join(uninstallRoot, '.planning'));
const uninstallPlan = invoke(['uninstall', uninstallRoot, '--dry-run', '--json']);
assert.equal(uninstallPlan.status, 2, uninstallPlan.stderr);
const leavePlan = JSON.parse(uninstallPlan.stdout);
assert.equal(leavePlan.operation, 'leave');
assert.equal(leavePlan.status, 'blocked');
assert(leavePlan.blockers.some((entry) => entry.code === 'NOT_ADOPTED'));
assert(fs.existsSync(path.join(uninstallRoot, '.planning')), 'dry-run uninstall must not mutate project');
const legacyUpdate = invoke([
  'update', '--archive', path.join(uninstallRoot, 'legacy-release.tar.gz'),
  '--target', uninstallRoot, '--apply', '--json',
]);
assert.equal(legacyUpdate.status, 64);
assert.match(JSON.parse(legacyUpdate.stdout).message, /receipt-owned/);
const legacyRollback = invoke([
  'rollback', path.join(uninstallRoot, 'legacy-backup'),
  '--target', uninstallRoot, '--apply', '--json',
]);
assert.equal(legacyRollback.status, 64);
assert.match(JSON.parse(legacyRollback.stdout).message, /receipt-owned/);

const doctorCapture = captureIo();
const doctor = cli.doctorReport(['--runtime', 'codex'], { env: {}, probe: () => false });
assert(doctor.checks.some((check) => check.name === 'runtime-selection' && check.pass && check.runtime === 'codex'));
assert(doctor.checks.some((check) => check.name === 'runtime-command' && !check.pass));
assert.equal(doctor.pass, false);
assert.equal(cli.main(['pack', '--help'], { io: doctorCapture.io, cwd: ROOT }), cli.EXIT.USAGE);
assert.match(doctorCapture.output.stderr, /unknown command/);

const packRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-npm-pack-'));
const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const npmEnvironment = { ...process.env, npm_config_cache: path.join(packRoot, 'npm-cache') };
const packed = fs.existsSync(npmCli)
  ? spawnSync(process.execPath, [npmCli, 'pack', '--json', '--pack-destination', packRoot], {
    cwd: ROOT, env: npmEnvironment, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  })
  : spawnSync('npm', ['pack', '--json', '--pack-destination', packRoot], {
    cwd: ROOT, env: npmEnvironment, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  });
assert.equal(packed.status, 0, packed.stderr);
const packedInfo = JSON.parse(packed.stdout);
const archive = path.join(packRoot, packedInfo[0].filename);
const entries = tarEntries(zlib.gunzipSync(fs.readFileSync(archive)));
const names = new Set(entries.map((entry) => entry.name));
for (const required of [
  'package/bin/citadel.js', 'package/core/cli/package-cli.js', 'package/scripts/install.js',
  'package/core/adoption/index.js', 'package/scripts/adopt.js',
  'package/skills/unharness/SKILL.md',
  'package/skills/do/SKILL.md', 'package/.planning/_templates/campaign.md',
]) assert(names.has(required), `packed archive missing ${required}`);
for (const forbidden of [
  'package/.github/workflows/release.yml',
  'package/.planning/campaigns/citadel-product-proof.md',
  'package/.planning/research/twelve-month-unlocks/product-growth-audit.md',
  'package/mcp-servers/codebase-memory/index.js',
  'package/packages/contracts/index.js',
  'package/packs/code-review/pack.json',
  'package/scripts/control-plane-stdio.js',
  'package/workflows/verify-change.yml',
]) assert(!names.has(forbidden), `packed archive leaked ${forbidden}`);
const binEntry = entries.find((entry) => entry.name === 'package/bin/citadel.js');
assert(binEntry.size > 0, 'npm tarball CLI entrypoint must contain executable code');

const installedRoot = path.join(packRoot, 'installed');
const installPacked = fs.existsSync(npmCli)
  ? spawnSync(process.execPath, [npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', installedRoot, archive], {
    cwd: packRoot, env: npmEnvironment, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  })
  : spawnSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', installedRoot, archive], {
    cwd: packRoot, env: npmEnvironment, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  });
assert.equal(installPacked.status, 0, installPacked.stderr);
const installedBin = path.join(installedRoot, 'node_modules', 'citadel', 'bin', 'citadel.js');
const shim = path.join(installedRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'citadel.cmd' : 'citadel');
assert(fs.existsSync(shim), 'package install must create the citadel executable shim');
if (process.platform !== 'win32') assert(fs.statSync(shim).mode & 0o111, 'installed citadel shim must be executable');
const packedHelp = spawnSync(process.execPath, [installedBin, '--help'], {
  cwd: packRoot, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
});
assert.equal(packedHelp.status, 0, packedHelp.stderr);
assert(packedHelp.stdout.includes('Citadel'));

for (const directory of [markerRoot, installRoot, autoRoot, uninstallRoot, packRoot]) {
  fs.rmSync(directory, { recursive: true, force: true });
}

process.stdout.write('CLI package tests passed.\n');
