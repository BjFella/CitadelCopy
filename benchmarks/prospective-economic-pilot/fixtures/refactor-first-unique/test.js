'use strict';
const assert = require('assert');
const { uniqueById } = require('./src/unique');
const first = { id: 1, value: 'first' };
const second = { id: 1, value: 'second' };
assert.deepStrictEqual(uniqueById([first, second]), [first]);
