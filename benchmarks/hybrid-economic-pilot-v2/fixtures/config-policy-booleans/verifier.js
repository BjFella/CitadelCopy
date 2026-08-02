'use strict';
const assert=require('assert');
assert.deepStrictEqual(require('./config/policy.json'),{schema:2,policy:'bounded',require_verifier:true,allow_retry:false});
