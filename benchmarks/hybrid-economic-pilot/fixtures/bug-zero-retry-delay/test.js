'use strict';
const assert = require('assert');
const { retryDelay } = require('./src/retry');
assert.strictEqual(retryDelay(0), 0);
assert.strictEqual(retryDelay(null), 250);
assert.strictEqual(retryDelay(500), 500);
