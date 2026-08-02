'use strict';
const assert = require('assert');
const { normalizeStatus } = require('./src/status');
assert.strictEqual(normalizeStatus(' READY '), 'ready');
assert.strictEqual(normalizeStatus('Failed'), 'failed');
assert.strictEqual(normalizeStatus(''), '');
assert.strictEqual(normalizeStatus(null), 'unknown');
assert.strictEqual(normalizeStatus(3), 'unknown');
