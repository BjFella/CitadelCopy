'use strict';
const assert = require('assert');
const { clamp } = require('./src/clamp');
assert.strictEqual(clamp(-2, 0, 10), 0);
assert.strictEqual(clamp(12, 0, 10), 10);
assert.strictEqual(clamp(6, 0, 10), 6);
