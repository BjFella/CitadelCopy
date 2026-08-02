'use strict';
const assert=require('assert');const {effectivePrefix}=require('./src/prefix');
assert.strictEqual(effectivePrefix(''),'');assert.strictEqual(effectivePrefix(null),'citadel-');assert.strictEqual(effectivePrefix('run-'),'run-');
