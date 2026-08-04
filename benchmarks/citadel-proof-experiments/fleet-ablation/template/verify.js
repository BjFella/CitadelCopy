#!/usr/bin/env node
'use strict';

const assert = require('assert');

function verifyLabels() {
  const { normalizeLabels } = require('./src/normalize-labels');
  assert.deepStrictEqual(normalizeLabels([' Red ', 'BLUE', 'red', '', null, ' blue ', 'Green']), ['red', 'blue', 'green']);
  assert.deepStrictEqual(normalizeLabels([]), []);
}

function verifyRetries() {
  const { retryDelays } = require('./src/retry-delays');
  assert.deepStrictEqual(retryDelays(5, 10, 35), [10, 20, 35, 35, 35]);
  assert.deepStrictEqual(retryDelays(0, 10, 35), []);
  assert.throws(() => retryDelays(-1, 10, 35));
  assert.throws(() => retryDelays(1.5, 10, 35));
  assert.throws(() => retryDelays(1, 0, 35));
  assert.throws(() => retryDelays(1, 40, 35));
}

const target = process.argv[2] || 'all';
if (!['all', 'normalize-labels', 'retry-delays'].includes(target)) throw new Error(`unknown verification target ${target}`);
if (target === 'all' || target === 'normalize-labels') verifyLabels();
if (target === 'all' || target === 'retry-delays') verifyRetries();
process.stdout.write(`verified ${target}\n`);
