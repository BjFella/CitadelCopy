'use strict';
const assert = require('assert');
const { parseBearer } = require('./src/auth');
assert.strictEqual(parseBearer('Bearer abc123'), 'abc123');
assert.strictEqual(parseBearer('bearer   token'), 'token');
assert.strictEqual(parseBearer('BEARER x.y-z_9'), 'x.y-z_9');
for (const value of ['Basic abc', 'Bearer', 'Bearer a b', ' Bearer abc', 'Bearer abc ', '', null, 4]) assert.strictEqual(parseBearer(value), null);
