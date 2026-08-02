'use strict';
const assert = require('assert');
const { safeHeaderValue } = require('./src/header');
assert.strictEqual(safeHeaderValue('safe value'), 'safe value');
assert.strictEqual(safeHeaderValue(' spaced '), ' spaced ');
assert.strictEqual(safeHeaderValue('bad\rvalue'), null);
assert.strictEqual(safeHeaderValue('bad\nvalue'), null);
assert.strictEqual(safeHeaderValue('bad\r\nvalue'), null);
assert.strictEqual(safeHeaderValue(3), null);
