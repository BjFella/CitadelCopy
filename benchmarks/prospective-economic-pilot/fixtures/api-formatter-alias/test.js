'use strict';
const assert = require('assert');
const api = require('./src/format');
assert.strictEqual(api.formatItem({ id: 7, label: 'ready' }), '7: ready');
assert.strictEqual(api.formatLegacy, api.formatItem);
