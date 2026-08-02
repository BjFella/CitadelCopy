'use strict';

const fs = require('fs');
const path = require('path');
const { digest } = require('../core/operation-control/contracts');

function readResult(file, instanceId) {
  if (!fs.existsSync(file)) return { status: 'error', result_digest: null, reason: 'results-json-missing' };
  const result = JSON.parse(fs.readFileSync(file, 'utf8'));
  const status = result.success_ids?.includes(instanceId) ? 'passed' : result.failure_ids?.includes(instanceId) ? 'failed' : result.empty_patch_ids?.includes(instanceId) ? 'failed' : 'error';
  return { status, result_digest: digest(result), reason: status === 'error' ? 'official-evaluator-error-or-incomplete' : null };
}

function summarize({ mode, instanceId, split, featureKey, outputRoot, repetitions, outputFile }) {
  const attempts = Array.from({ length: repetitions }, (_, index) => ({ repetition: index + 1, ...readResult(path.join(outputRoot, `run-${index + 1}`, 'results.json'), instanceId) }));
  const unsigned = { schema: 1, kind: 'citadel_public_holdout_evaluator_summary', summary_id: null, mode, instance_id: instanceId, repo: process.env.CITADEL_TASK_REPO || null, split, feature_key: featureKey, evaluator_repo: 'https://github.com/microsoft/SWE-bench-Live', evaluator_commit: '70ec57e852e3f2d195790fe71f553e272c691833', runner: { os: process.env.RUNNER_OS || null, arch: process.env.RUNNER_ARCH || null, name: process.env.RUNNER_NAME || null, image: process.env.ImageOS || null }, attempts, passes: attempts.filter((attempt) => attempt.status === 'passed').length, failures: attempts.filter((attempt) => attempt.status === 'failed').length, errors: attempts.filter((attempt) => attempt.status === 'error').length };
  const summary = { ...unsigned, summary_id: digest(unsigned) };
  fs.mkdirSync(path.dirname(outputFile), { recursive: true }); fs.writeFileSync(outputFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  return summary;
}

function main() {
  const [mode, instanceId, split, featureKey, outputRoot, repetitions, outputFile] = process.argv.slice(2);
  const summary = summarize({ mode, instanceId, split, featureKey, outputRoot, repetitions: Number(repetitions), outputFile });
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

if (require.main === module) main();
module.exports = Object.freeze({ readResult, summarize });
