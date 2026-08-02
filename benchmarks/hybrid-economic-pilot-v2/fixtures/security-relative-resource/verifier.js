'use strict';
const assert=require('assert');const {isRelativeResource}=require('./src/resource');
for(const value of ['assets/report.json','report.json','a/b/c'])assert.strictEqual(isRelativeResource(value),true);
for(const value of ['','/absolute','\\absolute','../secret','a/../b','a\\..\\b','./file','a/./b','C:\\file','https://x/file','nul\0file',null,4])assert.strictEqual(isRelativeResource(value),false);
