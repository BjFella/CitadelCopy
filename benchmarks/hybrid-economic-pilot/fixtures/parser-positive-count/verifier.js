'use strict';
const assert = require('assert');
const { parseCount } = require('./src/count');
for (const [value, expected] of [['1', 1], ['20', 20], ['1000', 1000], ['0', 1], ['1001', 1], ['20x', 1], [' 20', 1], ['+20', 1], ['1.5', 1], ['', 1], [null, 1], [20, 1]]) assert.strictEqual(parseCount(value), expected);
