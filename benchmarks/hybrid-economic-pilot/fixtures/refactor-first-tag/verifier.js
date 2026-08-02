'use strict';
const assert = require('assert');
const { uniqueTags } = require('./src/tags');
const input = ['Alpha', 'alpha', 'BETA', 'beta', 'Gamma'];
assert.deepStrictEqual(uniqueTags(input), ['Alpha', 'BETA', 'Gamma']);
assert.deepStrictEqual(input, ['Alpha', 'alpha', 'BETA', 'beta', 'Gamma']);
assert.deepStrictEqual(uniqueTags([]), []);
