'use strict';
const assert = require('assert');
const fs = require('fs');
const readme = fs.readFileSync('README.md', 'utf8');
assert(readme.includes('For a trace-enabled local start, run `CITADEL_TRACE=true npm run start`.'));
assert(readme.includes('The trace is useful while diagnosing an operation.'));
assert(!readme.includes('CITADEL_TRACE=1'));
