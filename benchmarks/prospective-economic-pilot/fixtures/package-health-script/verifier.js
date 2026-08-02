'use strict';
const assert = require('assert');
const value = require('./package.json');
assert.deepStrictEqual(value, { name: 'fixture-service', private: true, scripts: { start: 'node server.js', test: 'node test.js', health: 'node scripts/health-check.js' } });
