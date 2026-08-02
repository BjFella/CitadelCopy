'use strict';
const assert=require('assert');const {findLabel}=require('./src/labels');const labels=[{key:'Owner',value:'Seth'},{key:'owner',value:'later'}];const before=JSON.stringify(labels);
assert.strictEqual(findLabel(labels,'OWNER'),'Seth');assert.strictEqual(findLabel(labels,'owner'),'Seth');assert.strictEqual(findLabel(labels,'missing'),null);assert.strictEqual(findLabel(null,'x'),null);assert.strictEqual(findLabel(labels,null),null);assert.strictEqual(JSON.stringify(labels),before);
