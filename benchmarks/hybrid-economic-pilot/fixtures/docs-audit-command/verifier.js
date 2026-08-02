'use strict';
const assert = require('assert');
const fs = require('fs');
const value = fs.readFileSync('GETTING_STARTED.md', 'utf8');
assert(value.includes('Run `citadel operation audit` after the operation completes.'));
assert(value.includes('This check does not ask the model to grade itself.'));
assert(!value.includes('citadel evidence audit'));
