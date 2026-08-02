'use strict';
const assert = require('assert');
const { isSafeFilename } = require('./src/filename');
assert.strictEqual(isSafeFilename('report.json'), true);
assert.strictEqual(isSafeFilename('../secret'), false);
assert.strictEqual(isSafeFilename('..\\secret'), false);
