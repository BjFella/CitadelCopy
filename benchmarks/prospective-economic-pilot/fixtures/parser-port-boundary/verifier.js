'use strict';
const assert = require('assert');
const { parsePort } = require('./src/port');
assert.strictEqual(parsePort('1'), 1);
assert.strictEqual(parsePort('8080'), 8080);
assert.strictEqual(parsePort('65535'), 65535);
for (const value of ['0', '65536', '8080x', ' 80', '+80', '1.5', '', null, 80]) assert.strictEqual(parsePort(value), 3000);
