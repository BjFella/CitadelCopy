#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { digest } = require('../core/operation-control/contracts');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_JSON = path.join(ROOT, 'docs', 'evidence-manifest.json');
const OUTPUT_MD = path.join(ROOT, 'docs', 'EVIDENCE_MANIFEST.md');
const CONFORMANCE_ROOT = path.join(ROOT, 'benchmarks', 'application-adapter-conformance');

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}

function normalized(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8').replace(/\r\n/g, '\n');
}

function artifact(relative, value = null) {
  const parsed = value || readJson(relative);
  return Object.freeze({ path: relative.replace(/\\/g, '/'), digest: digest(parsed) });
}

function buildManifest() {
  const optimizer = readJson('benchmarks/optimizer-proof/actual-report.json');
  const optimizerV2 = readJson('benchmarks/operation-control-v2/REPORT.json');
  const roma = readJson('benchmarks/roma-operation-control/published-run/bundle.json');
  const prospective = readJson('benchmarks/operation-control-v2/prospective/RESULTS.json');
  const readiness = readJson('benchmarks/sentient-readiness/published-run/bundle.json');
  const romaPolicies = Object.fromEntries(roma.summary.policies.map((entry) => [entry.policy_id, entry]));
  const readinessPolicies = Object.fromEntries(readiness.summary.policies.map((entry) => [entry.policy_id, entry]));
  const manifest = {
    schema: 1,
    kind: 'citadel-public-evidence-manifest',
    as_of: readiness.completed_at,
    claim_policy: 'Every value is generated from a canonical committed artifact. Unknown is never converted to zero.',
    claims: {
      optimizer_history: {
        evidence_class: 'retrospective-actual-run',
        cells: optimizerV2.source.cells,
        real_model_attempts: optimizerV2.source.model_attempts,
        verified: optimizerV2.source.verified_completions,
        failed: optimizerV2.source.failed,
        unknown: optimizerV2.source.unknown,
        false_passes: optimizerV2.source.adversarial_false_passes,
        performance_gate: optimizer.preliminary_performance_gate.status,
        adaptive_holdout_verified: optimizer.held_out.adaptive.verified_completions,
        adaptive_holdout_total: optimizer.held_out.adaptive.runs,
        actual_cash_status: 'unknown',
      },
      roma_operation_control: {
        evidence_class: 'prospective-stack-diagnostic',
        cells: roma.artifacts.length,
        evidence_result: roma.summary.evidence_result,
        performance_hypothesis: roma.summary.performance_hypothesis,
        false_passes: roma.summary.false_passes,
        citadel_verified: romaPolicies['citadel-whole-operation'].independently_verified_completions,
        citadel_total: romaPolicies['citadel-whole-operation'].cells,
        local_baseline_verified: romaPolicies['always-open-local'].independently_verified_completions,
        local_baseline_total: romaPolicies['always-open-local'].cells,
        actual_cash_status: 'unknown',
      },
      prospective_runtime: {
        evidence_class: prospective.evidence_class,
        attempts: Object.keys(prospective.cells).length,
        passed: Object.values(prospective.cells).filter((cell) => cell.status === 'passed').length,
        failed: Object.values(prospective.cells).filter((cell) => cell.status === 'failed').length,
        successful_runtime: 'claude-code',
        successful_model: prospective.cells.claude_public_clone.observed_model,
        actual_cash_status: prospective.cells.claude_public_clone.actual_cash.status,
        market_equivalent_usd: prospective.cells.claude_public_clone.market_equivalent.amount_usd,
      },
      prospective_local_economics: {
        evidence_class: 'prospective-local-economic-comparison',
        cells: readiness.artifacts.length,
        evidence_result: readiness.summary.evidence_result,
        baseline_verified: readinessPolicies['always-strong-local'].verified,
        baseline_total: readinessPolicies['always-strong-local'].cells,
        adaptive_verified: readinessPolicies['citadel-adaptive-local'].verified,
        adaptive_total: readinessPolicies['citadel-adaptive-local'].cells,
        quality_ratio: readiness.summary.comparison.quality_ratio,
        gpu_energy_reduction: readiness.summary.comparison.gpu_energy_reduction,
        modeled_cost_reduction: readiness.summary.comparison.modeled_cost_reduction,
        duration_reduction: readiness.summary.comparison.duration_reduction,
        false_passes: readiness.summary.false_passes,
        integrity_failures: readiness.summary.integrity_failures,
        actual_cash_status: readiness.summary.actual_end_to_end_cash_status,
      },
    },
    boundaries: [
      'The 120-cell optimizer result is retrospective and its performance gate failed.',
      'The 24-cell ROMA result proves control and evidence integration; its efficiency hypothesis failed.',
      'The Claude prospective cell proves one real runtime integration, not savings or broad reliability.',
      'The 72-cell local comparison improved quality and reduced measured GPU energy, but failed the frozen 30 percent economic gates.',
      'Actual end-to-end cash remains unknown wherever subscription allocation or whole-system energy is unmeasured.',
    ],
    artifacts: [
      artifact('benchmarks/optimizer-proof/actual-report.json', optimizer),
      artifact('benchmarks/roma-operation-control/published-run/bundle.json', roma),
      artifact('benchmarks/operation-control-v2/prospective/RESULTS.json', prospective),
      artifact('benchmarks/sentient-readiness/published-run/bundle.json', readiness),
    ],
  };
  manifest.manifest_digest = digest({ ...manifest, manifest_digest: null });
  return manifest;
}

function renderManifest(manifest) {
  const o = manifest.claims.optimizer_history;
  const r = manifest.claims.roma_operation_control;
  const p = manifest.claims.prospective_runtime;
  const l = manifest.claims.prospective_local_economics;
  return `# Citadel public evidence manifest

Generated from committed canonical artifacts. As of ${manifest.as_of}.

| Evidence | Result | Boundary |
|---|---|---|
| Optimizer history | ${o.cells} signed cells; ${o.real_model_attempts} real attempts; ${o.verified} verified; ${o.false_passes} false passes | Performance gate ${o.performance_gate}; retrospective |
| ROMA operation control | ${r.cells} cells; Citadel ${r.citadel_verified}/${r.citadel_total}; direct local ${r.local_baseline_verified}/${r.local_baseline_total} | Evidence ${r.evidence_result}; performance ${r.performance_hypothesis} |
| Prospective runtime | ${p.passed}/${p.attempts} passed; ${p.successful_runtime}/${p.successful_model} | Integration only; actual cash ${p.actual_cash_status} |
| Prospective local economics | adaptive ${l.adaptive_verified}/${l.adaptive_total}; baseline ${l.baseline_verified}/${l.baseline_total}; ${(l.gpu_energy_reduction * 100).toFixed(1)}% less GPU energy | Frozen economic result ${l.evidence_result}; actual cash ${l.actual_cash_status} |

## Claim boundaries

${manifest.boundaries.map((boundary) => `- ${boundary}`).join('\n')}

Manifest: \`${manifest.manifest_digest}\`
`;
}

function buildConformance(manifest = buildManifest()) {
  const roma = manifest.claims.roma_operation_control;
  const prospective = manifest.claims.prospective_runtime;
  const local = manifest.claims.prospective_local_economics;
  return {
    schema: 1,
    kind: 'citadel-application-adapter-conformance',
    as_of: manifest.as_of,
    contract: {
      required: ['requested_identity', 'observed_identity', 'outcome_verification', 'failure_preservation', 'cost_lenses'],
      rule: 'A runtime is actual-run conformant only when committed evidence exercises it. Contract-only tests are reported separately.',
    },
    adapters: [
      {
        id: 'claude-code-direct',
        runtime_family: 'frontier-coding-agent',
        evidence_level: 'prospective-actual-run',
        status: prospective.passed === 1 ? 'passed' : 'failed',
        requested_identity: 'claude-opus-5',
        observed_identity: prospective.successful_model,
        outcome_verification: 'independent repository verifier plus exact changed-path coverage',
        cost_lenses: { actual_cash: 'unknown', market_equivalent: 'known' },
      },
      {
        id: 'ollama-chat-local',
        runtime_family: 'open-local-model-runtime',
        evidence_level: 'prospective-actual-run',
        status: local.cells === 72 && local.integrity_failures === 0 ? 'passed-with-observed-runtime-failure' : 'failed',
        requested_identity: 'exact Qwen2.5-Coder manifest digests',
        observed_identity: '71/72 completed attempts; one timeout before model identity was observed',
        outcome_verification: 'exact canonical answer digest',
        cost_lenses: { provider_invoice: 'known-zero', gpu_energy: 'measured', actual_end_to_end_cash: 'unknown' },
      },
      {
        id: 'roma-dspy-recursive-stack',
        runtime_family: 'open-recursive-agent-stack',
        evidence_level: 'prospective-actual-run',
        status: roma.evidence_result,
        requested_identity: 'pinned ROMA commit plus per-module Ollama manifests',
        observed_identity: 'configured modules and provider-call history reconciled',
        outcome_verification: 'exact canonical answer digest outside ROMA',
        cost_lenses: { provider_invoice: 'known-zero-local', actual_end_to_end_cash: 'unknown' },
      },
      {
        id: 'codex-direct',
        runtime_family: 'frontier-coding-agent',
        evidence_level: 'contract-and-launch-failure',
        status: 'unknown',
        requested_identity: 'explicit Codex model binding',
        observed_identity: 'not observed in the published Windows launch failure',
        outcome_verification: 'not reached',
        cost_lenses: { actual_cash: 'unknown', market_equivalent: 'unknown' },
      },
    ],
  };
}

function renderConformance(report) {
  const rows = report.adapters.map((adapter) => `| ${adapter.id} | ${adapter.runtime_family} | ${adapter.evidence_level} | ${adapter.status} | ${adapter.outcome_verification} |`).join('\n');
  return `# Citadel adapter conformance evidence

This report separates actual-run portability from contract-only support.

| Adapter | Family | Evidence | Status | Independent outcome gate |
|---|---|---|---|---|
${rows}

Codex remains an honest unknown at the prospective actual-run layer: its public
Windows attempt failed before model work. It is not counted as a successful
runtime merely because its adapter contract and fixtures pass.
`;
}

function expectedOutputs() {
  const manifest = buildManifest();
  const conformance = buildConformance(manifest);
  return {
    manifest,
    manifestMarkdown: renderManifest(manifest),
    conformance,
    conformanceMarkdown: renderConformance(conformance),
  };
}

function writeOutputs() {
  const output = expectedOutputs();
  fs.mkdirSync(CONFORMANCE_ROOT, { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(output.manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(OUTPUT_MD, output.manifestMarkdown, 'utf8');
  fs.writeFileSync(path.join(CONFORMANCE_ROOT, 'REPORT.json'), `${JSON.stringify(output.conformance, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(CONFORMANCE_ROOT, 'REPORT.md'), output.conformanceMarkdown, 'utf8');
  return output;
}

function checkOutputs() {
  const expected = expectedOutputs();
  assert.deepStrictEqual(readJson('docs/evidence-manifest.json'), expected.manifest);
  assert.strictEqual(normalized('docs/EVIDENCE_MANIFEST.md'), expected.manifestMarkdown.replace(/\r\n/g, '\n'));
  assert.deepStrictEqual(readJson('benchmarks/application-adapter-conformance/REPORT.json'), expected.conformance);
  assert.strictEqual(normalized('benchmarks/application-adapter-conformance/REPORT.md'), expected.conformanceMarkdown.replace(/\r\n/g, '\n'));
  return expected;
}

function main() {
  const command = process.argv[2] || 'check';
  const result = command === 'build' ? writeOutputs() : command === 'check' ? checkOutputs() : null;
  if (!result) throw new Error(`unknown application evidence command: ${command}`);
  process.stdout.write(`application evidence ${command} passed: ${result.manifest.manifest_digest}\n`);
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    process.stderr.write(`application evidence failed: ${error.stack || error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = Object.freeze({ buildConformance, buildManifest, checkOutputs, expectedOutputs, renderConformance, renderManifest, writeOutputs });
