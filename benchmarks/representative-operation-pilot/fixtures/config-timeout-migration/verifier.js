'use strict';
const assert = require('assert');
const config = require('./config/app.json');
assert.deepStrictEqual(config, { schema_version: 2, service: 'worker', timeout_seconds: 30, retries: 2 });
process.stdout.write('config migration verifier passed\n');
