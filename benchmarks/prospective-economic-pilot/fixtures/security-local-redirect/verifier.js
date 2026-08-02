'use strict';
const assert = require('assert');
const { isLocalRedirect } = require('./src/redirect');
for (const value of ['/account', '/a?b=1', '/']) assert.strictEqual(isLocalRedirect(value), true);
for (const value of ['//evil.example', '\\\\evil.example', 'https://evil.example', 'javascript:alert(1)', '', null, 4]) assert.strictEqual(isLocalRedirect(value), false);
