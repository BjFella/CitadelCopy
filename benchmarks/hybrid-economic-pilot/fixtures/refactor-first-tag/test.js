'use strict';
const assert = require('assert');
const { uniqueTags } = require('./src/tags');
assert.deepStrictEqual(uniqueTags(['Alpha', 'alpha', 'BETA']), ['Alpha', 'BETA']);
