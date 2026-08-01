'use strict';
const assert = require('assert');
const { dedupe } = require('./src/dedupe');
assert.deepStrictEqual(dedupe([1, '1', 1, 2, '1']), [1, '1', 2]);
const object = {};
assert.deepStrictEqual(dedupe([object, object, null, null]), [object, null]);
