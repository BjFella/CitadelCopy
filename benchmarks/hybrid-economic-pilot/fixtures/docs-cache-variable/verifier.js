'use strict';
const assert = require('assert');
const fs = require('fs');
const value = fs.readFileSync('README.md', 'utf8');
assert(value.includes('Set `CITADEL_CACHE_DIR=.citadel/cache` to move the operation cache.'));
assert(value.includes('The directory is created on first use.'));
assert(!value.includes('CITADEL_CACHE_PATH'));
