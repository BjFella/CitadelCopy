'use strict';
const assert = require('assert');
const parser = require('./src/parser');
const { loadRecord } = require('./src/consumer');
assert.strictEqual(parser.parseLegacy, parser.parseRecord);
assert.deepStrictEqual(loadRecord('{"id":4}'), { id: 4 });
