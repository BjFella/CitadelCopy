'use strict';
const assert = require('assert');
const value = require('./config/settings.json');
assert.deepStrictEqual(value, { schema: 3, service: 'relay', enabled: true, retries: 4, backoff_ms: 250 });
