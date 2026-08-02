'use strict';
const assert = require('assert');
const fs = require('fs');
const quickstart = fs.readFileSync('QUICKSTART.md', 'utf8');
assert(quickstart.includes('After a run, use `citadel operation verify` to validate its evidence.'));
assert(quickstart.includes('The command does not contact a model.'));
assert(!quickstart.includes('citadel proof check'));
