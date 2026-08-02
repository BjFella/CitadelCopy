'use strict';
const assert = require('assert');
const value = require('./config/features.json');
assert.deepStrictEqual(value, { schema: 4, service: 'controller', audit_enabled: true, dry_run: false });
