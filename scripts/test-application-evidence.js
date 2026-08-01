#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  buildConformance,
  buildManifest,
  checkOutputs,
} = require('./application-evidence');

const manifest = buildManifest();
assert.strictEqual(manifest.claims.optimizer_history.cells, 120);
assert.strictEqual(manifest.claims.optimizer_history.false_passes, 0);
assert.strictEqual(manifest.claims.roma_operation_control.cells, 24);
assert.strictEqual(manifest.claims.roma_operation_control.performance_hypothesis, 'failed');
assert.strictEqual(manifest.claims.prospective_runtime.passed, 1);
assert.strictEqual(manifest.claims.prospective_local_economics.cells, 72);
assert.strictEqual(manifest.claims.prospective_local_economics.evidence_result, 'failed');
assert.strictEqual(manifest.claims.prospective_local_economics.gpu_energy_reduction, 0.098673);
assert.strictEqual(manifest.claims.fresh_clone_onboarding.status, 'passed');
assert.strictEqual(manifest.claims.fresh_clone_onboarding.steps_passed, 5);

const conformance = buildConformance(manifest);
assert.strictEqual(conformance.adapters.filter((adapter) => adapter.evidence_level === 'prospective-actual-run').length, 3);
assert.strictEqual(conformance.adapters.find((adapter) => adapter.id === 'codex-direct').status, 'unknown');
assert.strictEqual(conformance.adapters.find((adapter) => adapter.id === 'claude-code-direct').status, 'passed');

checkOutputs();
process.stdout.write('application evidence and adapter conformance passed\n');
