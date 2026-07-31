'use strict';

const fs = require('fs');
const path = require('path');

const UNKNOWN_LOCAL_RUNTIME = Object.freeze({
  id: 'local-unknown',
  displayName: 'Local runtime (not selected)',
  capabilities: Object.freeze({
    workspace: Object.freeze({
      support: 'full',
      notes: 'The local filesystem is available, but no agent runtime was selected.',
    }),
  }),
  degradations: Object.freeze(['runtime-not-selected']),
});

function normalizeRuntimeId(value) {
  const id = String(value || '').trim().toLowerCase();
  if (id === 'claude') return 'claude-code';
  if (id === 'responses' || id === 'responses-api') return 'openai';
  return id;
}

function runtimeContract(runtimeId) {
  const id = normalizeRuntimeId(runtimeId);
  if (id === 'codex') return require('../../runtimes/codex/runtime');
  if (id === 'claude-code') return require('../../runtimes/claude-code/runtime');
  if (id === 'openai') return require('../../runtimes/openai/runtime');
  return UNKNOWN_LOCAL_RUNTIME;
}

function detectRuntimeContract(projectRoot, options = {}) {
  if (options.runtime && typeof options.runtime === 'object') return options.runtime;
  const explicit = options.runtimeId
    || options.env?.CITADEL_RUNTIME
    || process.env.CITADEL_RUNTIME;
  if (explicit) return runtimeContract(explicit);

  const root = path.resolve(projectRoot || process.cwd());
  const codex = fs.existsSync(path.join(root, '.codex'));
  const claude = fs.existsSync(path.join(root, '.claude'));
  if (codex && !claude) return runtimeContract('codex');
  if (claude && !codex) return runtimeContract('claude-code');
  return UNKNOWN_LOCAL_RUNTIME;
}

module.exports = Object.freeze({
  UNKNOWN_LOCAL_RUNTIME,
  detectRuntimeContract,
  normalizeRuntimeId,
  runtimeContract,
});
