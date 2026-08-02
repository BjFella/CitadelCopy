'use strict';
const assert = require('assert');
const { parseBearer } = require('./src/auth');
assert.strictEqual(parseBearer('Bearer abc123'), 'abc123');
assert.strictEqual(parseBearer('bearer token'), 'token');
assert.strictEqual(parseBearer('Basic abc123'), null);
