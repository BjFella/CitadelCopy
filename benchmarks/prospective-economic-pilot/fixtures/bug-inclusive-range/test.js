'use strict';
const assert = require('assert');
const { isWithinRange } = require('./src/range');
assert.strictEqual(isWithinRange(1, 1, 3), true);
assert.strictEqual(isWithinRange(3, 1, 3), true);
assert.strictEqual(isWithinRange(2, 1, 3), true);
