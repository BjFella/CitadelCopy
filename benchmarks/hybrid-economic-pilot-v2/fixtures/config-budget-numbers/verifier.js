'use strict';
const assert=require('assert');
assert.deepStrictEqual(require('./config/budget.json'),{schema:5,account:'research',enabled:true,max_attempts:6,ceiling_cents:1200});
