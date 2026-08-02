'use strict';
const assert=require('assert');const {copyOwnMetadata}=require('./src/metadata');
assert.deepStrictEqual(copyOwnMetadata({safe:1,constructor:'bad'}),{safe:1});
