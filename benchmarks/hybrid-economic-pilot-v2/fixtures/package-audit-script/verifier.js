'use strict';
const assert=require('assert');
assert.deepStrictEqual(require('./package.json'),{name:'audit-fixture',private:true,scripts:{start:'node app.js',test:'node test.js',audit:'node scripts/audit.js --strict'}});
