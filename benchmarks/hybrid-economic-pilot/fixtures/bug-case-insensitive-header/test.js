'use strict';
const assert = require('assert');
const { readHeader } = require('./src/headers');
const entries = [{ name: 'Content-Type', value: 'json' }, { name: 'content-type', value: 'text' }];
assert.strictEqual(readHeader(entries, 'CONTENT-TYPE'), 'json');
assert.strictEqual(readHeader(entries, 'missing'), null);
