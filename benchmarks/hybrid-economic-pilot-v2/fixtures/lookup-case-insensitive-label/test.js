'use strict';
const assert=require('assert');const {findLabel}=require('./src/labels');const labels=[{key:'Owner',value:'Seth'},{key:'owner',value:'later'}];
assert.strictEqual(findLabel(labels,'OWNER'),'Seth');assert.strictEqual(findLabel(labels,'missing'),null);
