'use strict';
const assert = require('assert');
const { effectiveTimeout } = require('./src/timeout');
assert.strictEqual(effectiveTimeout(0), 0);
assert.strictEqual(effectiveTimeout(null), 30);
assert.strictEqual(effectiveTimeout(12), 12);
