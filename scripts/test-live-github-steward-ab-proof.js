#!/usr/bin/env node
'use strict';

const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.join(__dirname, 'live-github-steward-ab-proof.js');
const PUBLISHED_RESULT = path.join(__dirname, '..', 'benchmarks', 'citadel-proof-experiments', 'deploy-steward', 'live-github-result.json');
const proof = require('./live-github-steward-ab-proof');
const contract = proof.loadContract();
let passed = 0;

function test(name, fn) {
  try { fn(); passed += 1; process.stdout.write(`PASS ${name}\n`); }
  catch (error) { process.stderr.write(`FAIL ${name}\n${error.stack}\n`); process.exitCode = 1; }
}

function protectionReadback() {
  return {
    required_status_checks: { strict: true, contexts: ['verify'] },
    enforce_admins: { enabled: true },
    required_linear_history: { enabled: true },
    required_conversation_resolution: { enabled: true },
  };
}

function armEvidence(options = {}) {
  const prs = Array.from({ length: 15 }, (_, index) => {
    const sha = `merge-${index + 1}`;
    return {
      number: index + 1, state: 'MERGED', mergeCommit: { oid: sha },
      statusCheckRollup: [{ name: 'verify', conclusion: 'SUCCESS' }],
    };
  });
  const deployments = prs.map((pr, index) => ({ id: index + 1, sha: pr.mergeCommit.oid, statuses: [{ state: 'success' }] }));
  return {
    prs: options.prs || prs,
    deployments: options.deployments || deployments,
    workflowRuns: prs.map((pr) => ({ headSha: `head-${pr.number}`, conclusion: 'success' })),
    telemetry: options.telemetry || [],
    actionsPermissions: { enabled: true, allowed_actions: 'all' },
    protection: options.protection || protectionReadback(),
  };
}

test('contract freezes two public 15-PR arms and durable evidence', () => {
  assert.deepEqual(contract.arms, ['control', 'treatment']);
  assert.equal(contract.prs_per_arm, 15);
  assert.equal(contract.visibility, 'public');
  assert(contract.required_evidence.includes('github-deployments-by-merge-sha'));
  assert.match(contract.evidence_boundary, /simulated deployment evidence, not a real production deploy/);
  assert.equal(contract.success.treatment_race_attempts_less_than_control, true);
});

test('published live result stays bound to the frozen contract and public claims', () => {
  const result = JSON.parse(fs.readFileSync(PUBLISHED_RESULT, 'utf8'));
  const plan = proof.createPlan({ runId: result.run_id }, contract);
  assert.equal(result.contract_sha256, plan.contractSha256);
  assert.equal(result.validation_passed, true);
  assert.deepEqual([result.control.pull_requests, result.control.merged, result.control.successful_deployments], [15, 15, 15]);
  assert.deepEqual([result.treatment.pull_requests, result.treatment.merged, result.treatment.successful_deployments], [15, 15, 15]);
  assert.equal(result.control.failed_merge_races, 34);
  assert.equal(result.control.interventions, 139);
  assert.equal(result.treatment.failed_merge_races, 0);
  assert.equal(result.treatment.interventions, 0);
  assert.match(result.claim_boundary, /not production releases/);
});

test('default invocation produces a deterministic mutation-free plan', () => {
  const result = cp.spawnSync(process.execPath, [SCRIPT, '--run-id', 'proof-20260804'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.mutationMode, 'plan-only');
  assert.equal(plan.repositories.control, 'citadel-steward-proof-20260804-control');
  assert.equal(plan.repositories.treatment, 'citadel-steward-proof-20260804-treatment');
  assert.equal(plan.totalPrs, 30);
  assert.match(plan.contractSha256, /^[a-f0-9]{64}$/);
});

test('argument validation requires explicit execute and exact cleanup confirmation', () => {
  const planned = proof.parseArgs(['--run-id', 'stable-run']);
  proof.validateArgs(planned);
  assert.equal(planned.execute, undefined);
  assert.throws(() => proof.validateArgs(proof.parseArgs(['--run-id', 'BAD'])) , /stable lowercase slug/);
  assert.throws(() => proof.validateArgs(proof.parseArgs(['--run-id', 'stable-run', '--cleanup'])), /exact run ID/);
  assert.throws(() => proof.validateArgs(proof.parseArgs(['--run-id', 'stable-run', '--execute', '--cleanup', '--confirm-delete', 'stable-run'])), /mutually exclusive/);
});

test('branch protection is strict, admin-enforced, and read back fail-closed', () => {
  const payload = proof.protectionPayload(contract);
  assert.equal(payload.required_status_checks.strict, true);
  assert.deepEqual(payload.required_status_checks.contexts, ['verify']);
  assert.equal(payload.enforce_admins, true);
  assert.equal(payload.required_linear_history, true);
  assert.equal(payload.required_conversation_resolution, true);
  assert.equal(proof.assertProtection(protectionReadback(), contract), true);
  assert.throws(() => proof.assertProtection({ ...protectionReadback(), enforce_admins: { enabled: false } }, contract), /admin enforcement/);
  assert.equal(proof.assertActionsPermissions({ enabled: true, allowed_actions: 'all' }), true);
  assert.throws(() => proof.assertActionsPermissions({ enabled: false, allowed_actions: 'all' }), /not enabled/);
});

test('workflow exposes the exact required check and no write permission', () => {
  const yaml = proof.workflowYaml({ ciSleepSeconds: 8 }, contract);
  assert.match(yaml, /  verify:\n    name: verify/);
  assert.match(yaml, /permissions:\n  contents: read/);
  assert.doesNotMatch(yaml, /contents: write/);
});

test('standalone steward extraction accepts the checked-in line endings', () => {
  const source = proof.extractStewardScript();
  assert.match(source, /^#!\/usr\/bin\/env node\r?\n/);
  assert.match(source, /function main\(/);
});

test('resuming archives a prior failure instead of leaving stale failure state', () => {
  const lastError = { at: '2026-08-04T23:09:42.058Z', message: 'preflight failed' };
  const state = proof.beginAttempt({ status: 'failed', lastError });
  assert.equal(state.status, 'running');
  assert.equal(state.lastError, undefined);
  assert.deepEqual(state.errorHistory, [lastError]);
});

test('deployment recorder is SHA-keyed, idempotent, and durable on GitHub', () => {
  const source = proof.deploymentRecorder('owner/repo', 'citadel-proof');
  assert.match(source, /commits\/main/);
  assert.match(source, /deployments\?sha=/);
  assert.match(source, /existing\[0\]/);
  assert.match(source, /state: 'success'/);
  assert.match(source, /reused: existing\.length > 0/);
  assert.match(source, /simulated deploy evidence/);
});

test('workdir marker prevents cleanup or resume against unrelated paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'citadel-live-marker-test-'));
  const plan = proof.createPlan({ runId: 'marker-test' }, contract);
  assert.throws(() => proof.assertWorkDirMarker(root, plan, 'control'), /unmarked work directory/);
  fs.writeFileSync(path.join(root, '.citadel-live-proof.json'), JSON.stringify({ runId: 'other', arm: 'control' }));
  assert.throws(() => proof.assertWorkDirMarker(root, plan, 'control'), /unmarked work directory/);
  fs.writeFileSync(path.join(root, '.citadel-live-proof.json'), JSON.stringify({ runId: plan.runId, arm: 'control' }));
  proof.assertWorkDirMarker(root, plan, 'control');
  fs.rmSync(root, { recursive: true, force: true });
});

test('GitHub failures are classified for race and intervention telemetry', () => {
  assert.equal(proof.classifyGhError(new Error('head branch was modified')), 'stale');
  assert.equal(proof.classifyGhError(new Error('required status check is pending')), 'checks');
  assert.equal(proof.classifyGhError(new Error('merge conflict')), 'conflict');
  assert.equal(proof.classifyGhError(new Error('opaque failure')), 'unknown');
});

test('summaries require exactly one successful deployment per merge SHA', () => {
  const summary = proof.summarizeArm(armEvidence({ telemetry: [
    { event: 'stale' }, { event: 'race' }, { event: 'intervention' },
  ] }), contract);
  assert.equal(summary.prs, 15);
  assert.equal(summary.merged, 15);
  assert.equal(summary.exactlyOnceDeployments, true);
  assert.equal(summary.workflowEvidenceComplete, true);
  assert.equal(summary.staleAttempts, 1);
  assert.equal(summary.raceAttempts, 1);
  assert.equal(summary.interventions, 1);

  const duplicate = armEvidence();
  duplicate.deployments.push({ id: 99, sha: 'merge-1', statuses: [{ state: 'success' }] });
  assert.equal(proof.summarizeArm(duplicate, contract).exactlyOnceDeployments, false);
});

test('final validation fails honestly on missing, unknown, or incomplete evidence', () => {
  const control = proof.summarizeArm(armEvidence({ telemetry: [
    { event: 'race' }, { event: 'race' }, { event: 'intervention' }, { event: 'intervention' },
  ] }), contract);
  const treatment = proof.summarizeArm(armEvidence(), contract);
  const passedResult = proof.validateResult({ arms: { control, treatment } }, contract);
  assert.equal(passedResult.passed, true);
  assert.deepEqual(passedResult.failures, []);
  assert.equal(passedResult.comparativeHypothesis.treatmentRaceAttemptsLessThanControl, true);

  treatment.workflowEvidenceComplete = false;
  const failed = proof.validateResult({ arms: { control, treatment } }, contract);
  assert.equal(failed.passed, false);
  assert(failed.failures.some((failure) => failure.includes('required check evidence incomplete')));
  assert.equal(proof.validateResult({ arms: { control } }, contract).passed, false);

  const extraDeploymentEvidence = armEvidence();
  extraDeploymentEvidence.deployments.push({ id: 99, sha: 'unrelated-sha', statuses: [{ state: 'success' }] });
  const extraDeployment = proof.validateResult({ arms: {
    control,
    treatment: proof.summarizeArm(extraDeploymentEvidence, contract),
  } }, contract);
  assert.equal(extraDeployment.passed, false);
  assert(extraDeployment.failures.some((failure) => failure.includes('deployment count did not equal')));

  const noComparativeWin = proof.validateResult({ arms: {
    control: proof.summarizeArm(armEvidence(), contract),
    treatment: proof.summarizeArm(armEvidence(), contract),
  } }, contract);
  assert.equal(noComparativeWin.passed, false);
  assert(noComparativeWin.failures.some((failure) => failure.includes('race attempts were not lower')));

  const interventionRegression = proof.validateResult({ arms: {
    control: proof.summarizeArm(armEvidence({ telemetry: [{ event: 'race' }] }), contract),
    treatment: proof.summarizeArm(armEvidence({ telemetry: [{ event: 'intervention' }] }), contract),
  } }, contract);
  assert.equal(interventionRegression.passed, false);
  assert(interventionRegression.failures.some((failure) => failure.includes('interventions exceeded control')));
});

if (!process.exitCode) process.stdout.write(`\n${passed}/13 live GitHub steward A/B harness tests passed\n`);
