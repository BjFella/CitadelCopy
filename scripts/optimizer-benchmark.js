#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  executorSetIdentity,
  loadExecutors,
  loadFreeze,
  loadScenarios,
  metricSetIdentity,
  scenarioSetIdentity,
  digest,
  validateBenchmarkShape,
} = require('../core/optimizer/contracts');
const { generateFixtureRuns, validateFixtureTruth } = require('../core/optimizer/fixture');
const { fixtureProbe, probeWorkspace } = require('../core/optimizer/probe');
const { route } = require('../core/optimizer/policy');
const { attestRun, buildReport } = require('../core/optimizer/report');
const { assertActualReady, runScenario } = require('../core/optimizer/runner');
const {
  pricingCoversExecutors,
  pricingSnapshotDigest,
  validatePricingSnapshot,
} = require('../core/optimizer/pricing');
const { platformInvocation } = require('../core/forks/launcher');
const { validateExecutorBindings } = require('../core/optimizer/executor-binding');
const {
  calibrationAuthorizationDigest,
  calibrationCases,
  calibrationObservation,
  validateCalibrationPlan,
  validateCalibrationRecord,
} = require('../core/optimizer/calibration');
const {
  externalReproductionDigest,
  validateExternalReproduction,
} = require('../core/optimizer/external-reproduction');

const ROOT = path.resolve(__dirname, '..');
const BENCHMARK_ROOT = path.join(ROOT, 'benchmarks', 'optimizer-proof');
const SCENARIO_DIRECTORY = path.join(BENCHMARK_ROOT, 'scenarios');
const EXECUTOR_FILE = path.join(BENCHMARK_ROOT, 'executors.json');
const FREEZE_FILE = path.join(BENCHMARK_ROOT, 'freeze.json');
const FIXTURE_TRUTH_FILE = path.join(BENCHMARK_ROOT, 'fixtures', 'truth.json');
const PRICING_FILE = path.join(BENCHMARK_ROOT, 'pricing.json');
const CALIBRATION_PLAN_FILE = path.join(BENCHMARK_ROOT, 'calibration-plan.json');
const CALIBRATION_RECORD_FILE = path.join(BENCHMARK_ROOT, 'calibration-record.json');
const EXTERNAL_REPRODUCTION_FILE = path.join(BENCHMARK_ROOT, 'external-reproduction.json');

function args(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) parsed._.push(token);
    else {
      const key = token.slice(2);
      const next = argv[index + 1];
      parsed[key] = next && !next.startsWith('--') ? argv[++index] : true;
    }
  }
  return parsed;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeJsonl(file, values) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, `${values.map((value) => JSON.stringify(value)).join('\n')}\n`, 'utf8');
}

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function checkedInBenchmark() {
  const scenarios = loadScenarios(SCENARIO_DIRECTORY);
  const executors = loadExecutors(EXECUTOR_FILE);
  validateBenchmarkShape(scenarios, executors);
  const freeze = loadFreeze(FREEZE_FILE, scenarios, executors);
  const fixtureTruth = validateFixtureTruth(JSON.parse(fs.readFileSync(FIXTURE_TRUTH_FILE, 'utf8')), scenarios);
  const calibrationPlan = validateCalibrationPlan(
    JSON.parse(fs.readFileSync(CALIBRATION_PLAN_FILE, 'utf8')),
    scenarios,
    executors,
  );
  if (digest(calibrationPlan) !== freeze.calibration_plan_digest) {
    throw new Error('Frozen calibration plan digest mismatch');
  }
  if (calibrationPlan.record_digest !== freeze.calibration_record_digest) {
    throw new Error('Calibration plan and freeze record digests differ');
  }
  let calibrationRecord = null;
  if (freeze.calibration_record_digest !== null) {
    if (!fs.existsSync(CALIBRATION_RECORD_FILE)) throw new Error('Frozen calibration record is missing');
    calibrationRecord = validateCalibrationRecord(
      JSON.parse(fs.readFileSync(CALIBRATION_RECORD_FILE, 'utf8')),
      calibrationPlan,
      scenarios,
      executors,
    );
    if (digest(calibrationRecord) !== freeze.calibration_record_digest) {
      throw new Error('Frozen calibration record digest mismatch');
    }
  }
  let pricingSnapshot = null;
  if (freeze.pricing_snapshot_digest !== null) {
    if (!fs.existsSync(PRICING_FILE)) throw new Error('Frozen pricing snapshot is missing');
    pricingSnapshot = validatePricingSnapshot(JSON.parse(fs.readFileSync(PRICING_FILE, 'utf8')));
    if (pricingSnapshotDigest(pricingSnapshot) !== freeze.pricing_snapshot_digest) {
      throw new Error('Frozen pricing snapshot digest mismatch');
    }
  }
  let externalReproduction = null;
  if (freeze.external_reproduction_digest !== null) {
    if (!fs.existsSync(EXTERNAL_REPRODUCTION_FILE)) throw new Error('Frozen external reproduction is missing');
    externalReproduction = validateExternalReproduction(
      JSON.parse(fs.readFileSync(EXTERNAL_REPRODUCTION_FILE, 'utf8')),
      freeze,
    );
    if (externalReproductionDigest(externalReproduction, freeze) !== freeze.external_reproduction_digest) {
      throw new Error('Frozen external reproduction digest mismatch');
    }
  }
  return {
    scenarios,
    executors,
    freeze,
    fixtureTruth,
    pricingSnapshot,
    calibrationPlan,
    calibrationRecord,
    externalReproduction,
  };
}

function runtimeProbe(runtime) {
  const command = runtime === 'claude' ? 'claude' : 'codex';
  let invocation;
  try {
    invocation = platformInvocation({ command, args: ['--version'] });
  } catch {
    invocation = { command, args: ['--version'] };
  }
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: false,
    timeout: 10000,
    windowsHide: true,
  });
  return {
    runtime,
    command,
    resolved_command: invocation.command,
    available: result.status === 0,
    version: result.status === 0 ? String(result.stdout || result.stderr || '').trim().slice(0, 200) : null,
    reason_code: result.status === 0
      ? 'RUNTIME_AVAILABLE'
      : result.error && result.error.code === 'ENOENT' ? 'RUNTIME_NOT_INSTALLED' : 'RUNTIME_NOT_LAUNCHABLE',
  };
}

function doctor(benchmark) {
  const runtimes = [...new Set(benchmark.executors.map((profile) => profile.runtime))].sort().map(runtimeProbe);
  const unresolvedModels = benchmark.executors
    .filter((profile) => profile.model.startsWith('runtime-default-'))
    .map((profile) => profile.profile_id);
  const unboundProfiles = benchmark.executors
    .filter((profile) => profile.executor_profile_digest === null)
    .map((profile) => profile.profile_id);
  const unboundAdapters = benchmark.executors
    .filter((profile) => profile.adapter_digest === null)
    .map((profile) => profile.profile_id);
  const invalidProfileBindings = benchmark.executors.every((profile) => profile.executor_profile_digest !== null)
    ? [...validateExecutorBindings(benchmark.executors)] : [];
  const blockers = [];
  if (runtimes.some((runtime) => !runtime.available)) blockers.push('RUNTIME_NOT_LAUNCHABLE');
  if (unresolvedModels.length) blockers.push('EXACT_MODELS_NOT_FROZEN');
  if (unboundProfiles.length) blockers.push('EXECUTOR_PROFILES_UNBOUND');
  if (invalidProfileBindings.length) blockers.push('EXECUTOR_PROFILE_BINDING_INVALID');
  if (unboundAdapters.length) blockers.push('EXECUTOR_ADAPTERS_UNBOUND');
  if (!benchmark.freeze.pricing_snapshot_digest) blockers.push('PRICING_SNAPSHOT_NOT_FROZEN');
  else if (!benchmark.pricingSnapshot || !pricingCoversExecutors(benchmark.pricingSnapshot, benchmark.executors)) {
    blockers.push('PRICING_SNAPSHOT_INCOMPLETE');
  }
  if (!benchmark.freeze.calibration_record_digest) blockers.push('CALIBRATION_REQUIRED');
  if (!benchmark.freeze.external_scenario) blockers.push('EXTERNAL_SCENARIO_NOT_SELECTED');
  if (!benchmark.freeze.external_reproduction_digest) blockers.push('EXTERNAL_REPRODUCTION_REQUIRED');
  if (!benchmark.freeze.attestation_public_key) blockers.push('ATTESTATION_KEY_NOT_FROZEN');
  return {
    schema: 1,
    kind: 'citadel_optimizer_doctor',
    status: blockers.length ? 'blocked' : 'ready',
    no_model_calls_made: true,
    runtimes,
    unresolved_models: unresolvedModels,
    unbound_profiles: unboundProfiles,
    invalid_profile_bindings: invalidProfileBindings,
    unbound_adapters: unboundAdapters,
    pricing_snapshot_digest: benchmark.freeze.pricing_snapshot_digest,
    calibration_record_digest: benchmark.freeze.calibration_record_digest,
    blockers,
  };
}

function privateKeyForRun(file, freeze) {
  const text = fs.readFileSync(path.resolve(file), 'utf8');
  const privateKey = crypto.createPrivateKey(text);
  if (privateKey.asymmetricKeyType !== 'ed25519') throw new Error('signing key must be Ed25519');
  const publicPem = crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'pem' });
  if (publicPem.trim() !== freeze.attestation_public_key.trim()) {
    throw new Error('signing key does not match the frozen attestation public key');
  }
  return privateKey;
}

function main() {
  const options = args(process.argv.slice(2));
  const command = options._[0] || 'validate';
  if (options.scenarios || options.executors || options.freeze) {
    throw new Error('Publishable optimizer commands use only checked-in frozen benchmark inputs');
  }
  const benchmark = checkedInBenchmark();

  if (command === 'validate') {
    process.stdout.write(`${JSON.stringify({
      valid: true,
      scenario_count: benchmark.scenarios.length,
      repository_count: new Set(benchmark.scenarios.map((scenario) => scenario.repository)).size,
      runtime_count: new Set(benchmark.executors.map((executor) => executor.runtime)).size,
      scenario_set_id: scenarioSetIdentity(benchmark.scenarios),
      executor_set_id: executorSetIdentity(benchmark.executors),
      metric_set_id: metricSetIdentity(),
      policies: benchmark.freeze.policies,
      repetitions: benchmark.freeze.repetitions,
      actual_run_status: doctor(benchmark).status,
    }, null, 2)}\n`);
    return;
  }

  if (command === 'doctor') {
    process.stdout.write(`${JSON.stringify(doctor(benchmark), null, 2)}\n`);
    return;
  }

  if (command === 'calibration-plan') {
    process.stdout.write(`${JSON.stringify({
      no_model_calls_made: true,
      plan: benchmark.calibrationPlan,
      blockers: doctor(benchmark).blockers,
    }, null, 2)}\n`);
    return;
  }

  if (command === 'calibrate') {
    if (!options.output) throw new Error('calibrate requires --output');
    if (benchmark.calibrationPlan.approval_status !== 'approved'
      || benchmark.calibrationPlan.quota_acknowledged !== true) {
      throw new Error('Calibration requires an explicitly approved subscription quota');
    }
    const readiness = doctor(benchmark);
    const allowedBlockers = new Set([
      'CALIBRATION_REQUIRED',
      'EXTERNAL_SCENARIO_NOT_SELECTED',
      'EXTERNAL_REPRODUCTION_REQUIRED',
      'ATTESTATION_KEY_NOT_FROZEN',
    ]);
    const blocking = readiness.blockers.filter((blocker) => !allowedBlockers.has(blocker));
    if (blocking.length) throw new Error(`Calibration readiness failed: ${blocking.join(', ')}`);
    const output = path.resolve(options.output);
    if (fs.existsSync(output)) throw new Error('Calibration output already exists');
    const adapterFile = path.join(ROOT, 'scripts', 'optimizer-runtime-adapter.js');
    const cases = calibrationCases(
      benchmark.calibrationPlan,
      benchmark.scenarios,
      benchmark.executors,
    );
    const record = {
      schema: 1,
      kind: 'citadel_optimizer_calibration_record',
      authorization_digest: calibrationAuthorizationDigest(benchmark.calibrationPlan),
      scenario_set_id: benchmark.freeze.scenario_set_id,
      executor_set_id: benchmark.freeze.executor_set_id,
      access_basis: benchmark.calibrationPlan.access_basis,
      quota_budget: benchmark.calibrationPlan.quota_budget,
      started_at: new Date().toISOString(),
      completed_at: null,
      status: 'running',
      planned_run_count: benchmark.calibrationPlan.total_runs,
      completed_run_count: 0,
      stop_reason: null,
      runs: [],
    };
    writeJson(output, validateCalibrationRecord(
      record,
      benchmark.calibrationPlan,
      benchmark.scenarios,
      benchmark.executors,
    ));
    for (const item of cases) {
      const run = runScenario({
        scenario: item.scenario,
        scenarios: benchmark.scenarios,
        executors: [item.profile],
        policyId: 'prompt-only',
        repetition: 1,
        adapterFile,
        pricingSnapshot: benchmark.pricingSnapshot,
      });
      const observation = calibrationObservation(run, item.profile);
      record.runs.push(observation);
      record.completed_run_count = record.runs.length;
      if (observation.evidence_status !== 'passed') {
        record.status = 'failed';
        record.completed_at = new Date().toISOString();
        record.stop_reason = 'CALIBRATION_EVIDENCE_FAILED';
      } else if (record.completed_run_count === record.planned_run_count) {
        record.status = 'passed';
        record.completed_at = new Date().toISOString();
      }
      writeJson(output, validateCalibrationRecord(
        record,
        benchmark.calibrationPlan,
        benchmark.scenarios,
        benchmark.executors,
      ));
      process.stdout.write(`${JSON.stringify({
        calibration_case: `${item.scenario.id}/${item.profile.profile_id}`,
        evidence_status: observation.evidence_status,
        completed_run_count: record.completed_run_count,
        planned_run_count: record.planned_run_count,
      })}\n`);
      if (record.status === 'failed') {
        process.exitCode = 2;
        return;
      }
    }
    process.stdout.write(`Calibration passed; record written to ${output}\n`);
    return;
  }

  if (command === 'matrix-plan') {
    const runs = [];
    for (const scenario of benchmark.scenarios) {
      for (const policy of benchmark.freeze.policies) {
        for (let repetition = 1; repetition <= benchmark.freeze.repetitions; repetition += 1) {
          runs.push({
            run_key: `${scenario.id}/${policy}/${repetition}`,
            scenario_id: scenario.id,
            policy_id: policy,
            repetition,
            holdout: scenario.holdout,
          });
        }
      }
    }
    process.stdout.write(`${JSON.stringify({
      schema: 1,
      kind: 'citadel_optimizer_matrix_plan',
      no_model_calls_made: true,
      scenario_set_id: benchmark.freeze.scenario_set_id,
      executor_set_id: benchmark.freeze.executor_set_id,
      metric_set_id: benchmark.freeze.metric_set_id,
      run_count: runs.length,
      execution_status: doctor(benchmark).status,
      blockers: doctor(benchmark).blockers,
      runs,
    }, null, 2)}\n`);
    return;
  }

  if (command === 'fixture') {
    if (!options.output) throw new Error('fixture requires --output');
    const runs = generateFixtureRuns(
      benchmark.scenarios,
      benchmark.executors,
      benchmark.fixtureTruth,
      benchmark.freeze.repetitions,
    );
    writeJsonl(options.output, runs);
    process.stdout.write(`Wrote ${runs.length} non-claim fixture simulations to ${options.output}\n`);
    return;
  }

  if (command === 'report') {
    if (!options.input || !options.output) throw new Error('report requires --input and --output');
    const report = buildReport(readJsonl(options.input), benchmark);
    writeJson(options.output, report);
    process.stdout.write(`Wrote ${report.claim_status} optimizer report (${report.submission_gate.status}) to ${options.output}\n`);
    return;
  }

  if (command === 'plan') {
    if (!options.scenario || !options.policy) throw new Error('plan requires --scenario and --policy');
    const scenario = benchmark.scenarios.find((item) => item.id === options.scenario);
    if (!scenario) throw new Error(`Unknown scenario: ${options.scenario}`);
    let probe;
    if (options.policy === 'adaptive') {
      if (options.repository) probe = probeWorkspace(options.repository, scenario);
      else if (options['fixture-probe']) {
        const truth = benchmark.fixtureTruth.scenarios.find((item) => item.scenario_id === scenario.id);
        probe = fixtureProbe(scenario, truth.probe_facts);
      } else {
        throw new Error('adaptive plan requires --repository or explicit --fixture-probe');
      }
    }
    const decision = route({
      scenario,
      executors: benchmark.executors,
      policyId: options.policy,
      probe,
    });
    process.stdout.write(`${JSON.stringify({ decision, probe: probe || null }, null, 2)}\n`);
    return;
  }

  if (command === 'run') {
    for (const required of ['scenario', 'policy', 'repetition', 'adapter', 'output', 'signing-key']) {
      if (!options[required]) throw new Error(`run requires --${required}`);
    }
    assertActualReady(benchmark.freeze, benchmark.executors);
    const scenario = benchmark.scenarios.find((item) => item.id === options.scenario);
    if (!scenario) throw new Error(`Unknown scenario: ${options.scenario}`);
    const privateKey = privateKeyForRun(options['signing-key'], benchmark.freeze);
    const unsigned = runScenario({
      scenario,
      scenarios: benchmark.scenarios,
      executors: benchmark.executors,
      policyId: options.policy,
      repetition: Number(options.repetition),
      adapterFile: options.adapter,
      pricingSnapshot: benchmark.pricingSnapshot,
    });
    const signed = attestRun(unsigned, privateKey);
    writeJson(options.output, signed);
    process.stdout.write(`Wrote attested actual optimizer run to ${options.output}\n`);
    return;
  }

  throw new Error(`Unknown optimizer benchmark command: ${command}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`Optimizer benchmark failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = Object.freeze({
  checkedInBenchmark,
  doctor,
  runtimeProbe,
});
