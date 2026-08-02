'use strict';
const assert = require('assert');
const { normalizeStatus } = require('./src/status');
assert.strictEqual(normalizeStatus(' READY '), 'ready');
assert.strictEqual(normalizeStatus(null), 'unknown');
