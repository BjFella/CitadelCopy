'use strict';

const fs = require('fs');
const path = require('path');
const {
  canonical,
  digest,
  exactFields,
  loadExecutors,
  loadFreeze,
  loadScenarios,
} = require('./contracts');
const { pricingSnapshotDigest, validatePricingSnapshot } = require('./pricing');
const { buildReport } = require('./report');
const { validateCalibrationPlan } = require('./calibration');
const {
  externalReproductionDigest,
  validateExternalReproduction,
} = require('./external-reproduction');

const MANIFEST_FIELDS = Object.freeze([
  'schema',
  'kind',
  'bundle_id',
  'claim_status',
  'scenario_set_id',
  'executor_set_id',
  'metric_set_id',
  'created_at',
  'files',
]);
const FILE_FIELDS = Object.freeze(['path', 'digest', 'bytes']);

function relativePosix(root, file) {
  const relative = path.relative(root, file);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Bundle path escapes output directory');
  }
  return relative.replace(/\\/g, '/');
}

function contained(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function realRegularFile(root, candidate) {
  if (!contained(root, candidate)) return false;
  try {
    const stat = fs.lstatSync(candidate);
    return stat.isFile()
      && !stat.isSymbolicLink()
      && contained(fs.realpathSync(root), fs.realpathSync(candidate));
  } catch {
    return false;
  }
}

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function fileRecord(root, file) {
  const bytes = fs.readFileSync(file);
  return Object.freeze({
    path: relativePosix(root, file),
    digest: digest(bytes.toString('utf8')),
    bytes: bytes.length,
  });
}

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
}

function writeFile(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, { encoding: 'utf8', flag: 'wx' });
}

function checkedInInputs(root) {
  const benchmarkRoot = path.join(root, 'benchmarks', 'optimizer-proof');
  const scenarioDirectory = path.join(benchmarkRoot, 'scenarios');
  const executorFile = path.join(benchmarkRoot, 'executors.json');
  const freezeFile = path.join(benchmarkRoot, 'freeze.json');
  const pricingFile = path.join(benchmarkRoot, 'pricing.json');
  const calibrationPlanFile = path.join(benchmarkRoot, 'calibration-plan.json');
  const externalReproductionFile = path.join(benchmarkRoot, 'external-reproduction.json');
  const scenarios = loadScenarios(scenarioDirectory);
  const executors = loadExecutors(executorFile);
  const freeze = loadFreeze(freezeFile, scenarios, executors);
  if (!realRegularFile(benchmarkRoot, calibrationPlanFile)) throw new Error('Frozen calibration plan is missing');
  const calibrationPlan = validateCalibrationPlan(
    JSON.parse(fs.readFileSync(calibrationPlanFile, 'utf8')),
    scenarios,
    executors,
  );
  if (digest(calibrationPlan) !== freeze.calibration_plan_digest) {
    throw new Error('Frozen calibration plan digest mismatch');
  }
  if (freeze.pricing_snapshot_digest !== null) {
    if (!realRegularFile(benchmarkRoot, pricingFile)) throw new Error('Frozen pricing snapshot is missing');
    const pricing = validatePricingSnapshot(JSON.parse(fs.readFileSync(pricingFile, 'utf8')));
    if (pricingSnapshotDigest(pricing) !== freeze.pricing_snapshot_digest) {
      throw new Error('Frozen pricing snapshot digest mismatch');
    }
  }
  let externalReproduction = null;
  if (freeze.external_reproduction_digest !== null) {
    if (!realRegularFile(benchmarkRoot, externalReproductionFile)) {
      throw new Error('Frozen external reproduction is missing');
    }
    externalReproduction = validateExternalReproduction(
      JSON.parse(fs.readFileSync(externalReproductionFile, 'utf8')),
      freeze,
    );
    if (externalReproductionDigest(externalReproduction, freeze) !== freeze.external_reproduction_digest) {
      throw new Error('Frozen external reproduction digest mismatch');
    }
  }
  return {
    benchmarkRoot,
    scenarioDirectory,
    executorFile,
    freezeFile,
    pricingFile: freeze.pricing_snapshot_digest === null ? null : pricingFile,
    calibrationPlanFile,
    externalReproductionFile: externalReproduction === null ? null : externalReproductionFile,
    externalReproduction,
    scenarios,
    executors,
    freeze,
  };
}

function ensureEmptyTarget(outputDirectory) {
  const resolved = path.resolve(outputDirectory);
  if (fs.existsSync(resolved)) {
    if (!fs.statSync(resolved).isDirectory() || fs.readdirSync(resolved).length > 0) {
      throw new Error('Bundle output directory must not exist or must be empty');
    }
  } else {
    fs.mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

function bundleReadme(report) {
  return `# Citadel Optimizer Proof Bundle

Claim status: **${report.claim_status}**

This directory contains frozen benchmark inputs, raw run records, the derived
report, and a content-addressed manifest.

Verify from a Citadel checkout:

\`\`\`bash
node scripts/optimizer-proof-bundle.js verify <bundle-directory>
\`\`\`

Fixture simulations validate the evidence machinery only. They are not model
performance or cost-savings evidence.
`;
}

function buildBundle({ root, rawFile, reportFile, outputDirectory }) {
  const inputs = checkedInInputs(root);
  const rawPath = fs.realpathSync(path.resolve(rawFile));
  const reportPath = fs.realpathSync(path.resolve(reportFile));
  if (!fs.statSync(rawPath).isFile() || !fs.statSync(reportPath).isFile()) {
    throw new Error('Bundle raw and report inputs must be files');
  }
  const runs = readJsonl(rawPath);
  const expectedReport = buildReport(runs, inputs);
  const providedReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (canonical(expectedReport) !== canonical(providedReport)) {
    throw new Error('Bundle report does not reproduce from raw evidence');
  }
  const output = ensureEmptyTarget(outputDirectory);
  copyFile(inputs.freezeFile, path.join(output, 'inputs', 'freeze.json'));
  copyFile(inputs.executorFile, path.join(output, 'inputs', 'executors.json'));
  copyFile(inputs.calibrationPlanFile, path.join(output, 'inputs', 'calibration-plan.json'));
  if (inputs.pricingFile !== null) {
    copyFile(inputs.pricingFile, path.join(output, 'inputs', 'pricing.json'));
  }
  if (inputs.externalReproductionFile !== null) {
    copyFile(inputs.externalReproductionFile, path.join(output, 'inputs', 'external-reproduction.json'));
  }
  for (const name of fs.readdirSync(inputs.scenarioDirectory).filter((item) => item.endsWith('.json')).sort()) {
    copyFile(
      path.join(inputs.scenarioDirectory, name),
      path.join(output, 'inputs', 'scenarios', name),
    );
  }
  copyFile(rawPath, path.join(output, 'evidence', 'raw.jsonl'));
  copyFile(reportPath, path.join(output, 'evidence', 'report.json'));
  writeFile(path.join(output, 'README.md'), bundleReadme(expectedReport));
  const files = [];
  for (const relative of [
    'README.md',
    'inputs/freeze.json',
    'inputs/executors.json',
    'inputs/calibration-plan.json',
    ...(inputs.pricingFile === null ? [] : ['inputs/pricing.json']),
    ...(inputs.externalReproductionFile === null ? [] : ['inputs/external-reproduction.json']),
    ...fs.readdirSync(path.join(output, 'inputs', 'scenarios')).sort()
      .map((name) => `inputs/scenarios/${name}`),
    'evidence/raw.jsonl',
    'evidence/report.json',
  ]) {
    files.push(fileRecord(output, path.join(output, ...relative.split('/'))));
  }
  const unsigned = {
    schema: 1,
    kind: 'citadel_optimizer_proof_bundle',
    bundle_id: null,
    claim_status: expectedReport.claim_status,
    scenario_set_id: expectedReport.scenario_set_id,
    executor_set_id: expectedReport.executor_set_id,
    metric_set_id: expectedReport.metric_set_id,
    created_at: expectedReport.generated_at,
    files,
  };
  const manifest = { ...unsigned, bundle_id: digest(unsigned) };
  writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return Object.freeze({ output, manifest });
}

function validateManifest(value) {
  if (!exactFields(value, MANIFEST_FIELDS)) throw new Error('Bundle manifest fields are invalid');
  if (value.schema !== 1 || value.kind !== 'citadel_optimizer_proof_bundle') {
    throw new Error('Bundle manifest identity is invalid');
  }
  if (!Array.isArray(value.files) || !value.files.length) throw new Error('Bundle manifest files are invalid');
  for (const file of value.files) {
    if (!exactFields(file, FILE_FIELDS)
      || typeof file.path !== 'string'
      || !file.path
      || path.isAbsolute(file.path)
      || file.path.includes('..')
      || !/^sha256:[0-9a-f]{64}$/.test(file.digest)
      || !Number.isInteger(file.bytes)
      || file.bytes < 0) {
      throw new Error('Bundle manifest file record is invalid');
    }
  }
  if (new Set(value.files.map((file) => file.path)).size !== value.files.length) {
    throw new Error('Bundle manifest file paths must be unique');
  }
  const unsigned = { ...value, bundle_id: null };
  if (value.bundle_id !== digest(unsigned)) throw new Error('Bundle ID does not bind the manifest');
  return value;
}

function listFiles(root, directory = root) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('Bundle cannot contain symlinks');
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...listFiles(root, candidate));
    else if (entry.isFile()) found.push(relativePosix(root, candidate));
    else throw new Error('Bundle contains an unsupported file type');
  }
  return found.sort();
}

function verifyBundle(bundleDirectory) {
  const root = fs.realpathSync(path.resolve(bundleDirectory));
  if (!fs.statSync(root).isDirectory() || fs.lstatSync(root).isSymbolicLink()) {
    throw new Error('Bundle root must be a real directory');
  }
  const manifestFile = path.join(root, 'manifest.json');
  if (!realRegularFile(root, manifestFile)) throw new Error('Bundle manifest is missing');
  const manifest = validateManifest(JSON.parse(fs.readFileSync(manifestFile, 'utf8')));
  const expectedPaths = [...manifest.files.map((file) => file.path), 'manifest.json'].sort();
  const actualPaths = listFiles(root);
  if (canonical(expectedPaths) !== canonical(actualPaths)) throw new Error('Bundle files do not match the manifest');
  for (const record of manifest.files) {
    const file = path.join(root, ...record.path.split('/'));
    if (!realRegularFile(root, file)) throw new Error(`Bundle file is unsafe: ${record.path}`);
    const actual = fileRecord(root, file);
    if (canonical(actual) !== canonical(record)) throw new Error(`Bundle file digest mismatch: ${record.path}`);
  }
  const scenarioDirectory = path.join(root, 'inputs', 'scenarios');
  const executors = loadExecutors(path.join(root, 'inputs', 'executors.json'));
  const scenarios = loadScenarios(scenarioDirectory);
  const freeze = loadFreeze(path.join(root, 'inputs', 'freeze.json'), scenarios, executors);
  const calibrationPlan = validateCalibrationPlan(
    JSON.parse(fs.readFileSync(path.join(root, 'inputs', 'calibration-plan.json'), 'utf8')),
    scenarios,
    executors,
  );
  if (digest(calibrationPlan) !== freeze.calibration_plan_digest) {
    throw new Error('Bundle calibration plan digest mismatch');
  }
  if (freeze.pricing_snapshot_digest !== null) {
    const pricingFile = path.join(root, 'inputs', 'pricing.json');
    if (!realRegularFile(root, pricingFile)) throw new Error('Bundle pricing snapshot is missing');
    const pricing = validatePricingSnapshot(JSON.parse(fs.readFileSync(pricingFile, 'utf8')));
    if (pricingSnapshotDigest(pricing) !== freeze.pricing_snapshot_digest) {
      throw new Error('Bundle pricing snapshot digest mismatch');
    }
  }
  let externalReproduction = null;
  if (freeze.external_reproduction_digest !== null) {
    const reproductionFile = path.join(root, 'inputs', 'external-reproduction.json');
    if (!realRegularFile(root, reproductionFile)) throw new Error('Bundle external reproduction is missing');
    externalReproduction = validateExternalReproduction(
      JSON.parse(fs.readFileSync(reproductionFile, 'utf8')),
      freeze,
    );
    if (externalReproductionDigest(externalReproduction, freeze) !== freeze.external_reproduction_digest) {
      throw new Error('Bundle external reproduction digest mismatch');
    }
  }
  const runs = readJsonl(path.join(root, 'evidence', 'raw.jsonl'));
  const report = JSON.parse(fs.readFileSync(path.join(root, 'evidence', 'report.json'), 'utf8'));
  const reproduced = buildReport(runs, {
    scenarios,
    executors,
    freeze,
    externalReproduction,
  });
  if (canonical(report) !== canonical(reproduced)) throw new Error('Bundle report does not reproduce');
  if (manifest.claim_status !== report.claim_status
    || manifest.scenario_set_id !== report.scenario_set_id
    || manifest.executor_set_id !== report.executor_set_id
    || manifest.metric_set_id !== report.metric_set_id) {
    throw new Error('Bundle manifest does not bind report identities');
  }
  return Object.freeze({
    valid: true,
    bundle_id: manifest.bundle_id,
    claim_status: manifest.claim_status,
    files_verified: manifest.files.length,
    report_reproduced: true,
  });
}

module.exports = Object.freeze({
  buildBundle,
  checkedInInputs,
  validateManifest,
  verifyBundle,
});
