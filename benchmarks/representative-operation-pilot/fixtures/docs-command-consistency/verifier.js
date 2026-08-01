'use strict';
const assert = require('assert');
const fs = require('fs');
const readme = fs.readFileSync('README.md', 'utf8');
assert(readme.includes('`/do setup --express`'));
assert(!readme.includes('`/do setup`'));
assert(readme.includes('The setup step creates local project state.'));
process.stdout.write('documentation verifier passed\n');
