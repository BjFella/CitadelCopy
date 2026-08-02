'use strict';
const assert = require('assert');
const api = require('./src/format');
assert.deepStrictEqual(Object.keys(api).sort(), ['formatItem', 'formatLegacy']);
assert.strictEqual(api.formatLegacy, api.formatItem);
assert.strictEqual(api.formatItem({ id: 7, label: 'ready' }), '7: ready');
