'use strict';
const assert = require('assert');
const value = require('./package.json');
assert.deepStrictEqual(value, { name: 'hybrid-fixture', private: true, scripts: { start: 'node index.js', verify: 'node verify.js', diagnose: 'node scripts/diagnose.js --json' } });
