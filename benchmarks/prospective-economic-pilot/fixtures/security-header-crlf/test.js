'use strict';
const assert = require('assert');
const { safeHeaderValue } = require('./src/header');
assert.strictEqual(safeHeaderValue('safe'), 'safe');
assert.strictEqual(safeHeaderValue('bad\r\nInjected: yes'), null);
