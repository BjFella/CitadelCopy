'use strict';
const assert = require('assert');
const { parseCount } = require('./src/count');
assert.strictEqual(parseCount('20'), 20);
assert.strictEqual(parseCount('20x'), 1);
assert.strictEqual(parseCount('0'), 1);
