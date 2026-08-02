'use strict';
const assert = require('assert');
const { isLocalRedirect } = require('./src/redirect');
assert.strictEqual(isLocalRedirect('/account'), true);
assert.strictEqual(isLocalRedirect('//evil.example'), false);
assert.strictEqual(isLocalRedirect('https://evil.example'), false);
