'use strict';
const assert = require('assert');
const { isSafeFilename } = require('./src/filename');
for (const value of ['report.json', 'a', 'name with spaces.txt']) assert.strictEqual(isSafeFilename(value), true);
for (const value of ['', '.', '..', '../secret', '..\\secret', 'dir/file', 'dir\\file', '/absolute', 'C:\\absolute', 'nul\0name', null, 4]) assert.strictEqual(isSafeFilename(value), false);
