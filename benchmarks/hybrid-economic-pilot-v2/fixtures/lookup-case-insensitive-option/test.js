'use strict';
const assert=require('assert');const {readOption}=require('./src/options');const values=[{name:'DryRun',value:true},{name:'dryrun',value:false}];
assert.strictEqual(readOption(values,'DRYRUN'),true);assert.strictEqual(readOption(values,'missing'),null);
