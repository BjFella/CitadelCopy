'use strict';
const assert=require('assert');
assert.deepStrictEqual(require('./package.json'),{name:'report-fixture',version:'1.0.0',scripts:{build:'node build.js',check:'node check.js',report:'node scripts/report.js --format json'}});
