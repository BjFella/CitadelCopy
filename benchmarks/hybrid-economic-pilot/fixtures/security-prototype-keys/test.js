'use strict';
const assert = require('assert');
const { copySafeOwn } = require('./src/copy');
assert.deepStrictEqual(copySafeOwn({ safe: 1, constructor: 'bad' }), { safe: 1 });
