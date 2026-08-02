'use strict';
const assert=require('assert');const {effectiveConcurrency}=require('./src/concurrency');
assert.strictEqual(effectiveConcurrency(0),0);assert.strictEqual(effectiveConcurrency(null),4);assert.strictEqual(effectiveConcurrency(8),8);
