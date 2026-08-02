'use strict';
const assert=require('assert');const {effectivePrefix}=require('./src/prefix');
assert.strictEqual(effectivePrefix(''),'');assert.strictEqual(effectivePrefix(0),0);assert.strictEqual(effectivePrefix(false),false);assert.strictEqual(effectivePrefix(null),'citadel-');assert.strictEqual(effectivePrefix(undefined),'citadel-');assert.strictEqual(effectivePrefix('run-'),'run-');
