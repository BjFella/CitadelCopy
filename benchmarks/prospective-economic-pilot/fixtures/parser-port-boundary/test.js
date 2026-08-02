'use strict';
const assert = require('assert');
const { parsePort } = require('./src/port');
assert.strictEqual(parsePort('8080'), 8080);
assert.strictEqual(parsePort('8080x'), 3000);
assert.strictEqual(parsePort('0'), 3000);
