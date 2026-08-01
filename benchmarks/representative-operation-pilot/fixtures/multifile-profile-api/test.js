'use strict';
const assert = require('assert');
const format = require('./src/format');
const { renderProfile } = require('./src/render');
const user = { name: 'Ada', email: 'ada@example.test' };
assert.strictEqual(typeof format.formatProfile, 'function');
assert.strictEqual(format.formatUser, format.formatProfile);
assert.strictEqual(format.formatProfile(user), 'Ada <ada@example.test>');
assert.strictEqual(renderProfile(user), 'Profile: Ada <ada@example.test>');
