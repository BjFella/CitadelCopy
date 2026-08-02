'use strict';
const assert=require('assert');const {readOption}=require('./src/options');const values=[{name:'DryRun',value:true},{name:'dryrun',value:false}];const before=JSON.stringify(values);
assert.strictEqual(readOption(values,'DRYRUN'),true);assert.strictEqual(readOption(values,'dryrun'),true);assert.strictEqual(readOption(values,'missing'),null);assert.strictEqual(readOption(null,'x'),null);assert.strictEqual(readOption(values,null),null);assert.strictEqual(JSON.stringify(values),before);
