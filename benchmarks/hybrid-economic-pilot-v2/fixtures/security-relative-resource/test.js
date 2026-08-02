'use strict';
const assert=require('assert');const {isRelativeResource}=require('./src/resource');
assert.strictEqual(isRelativeResource('assets/report.json'),true);assert.strictEqual(isRelativeResource('../secret'),false);assert.strictEqual(isRelativeResource('/absolute'),false);
