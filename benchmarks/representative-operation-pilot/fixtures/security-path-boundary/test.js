'use strict';
const assert = require('assert');
const path = require('path');
const { isWithinRoot } = require('./src/safe-path');
const root = path.resolve('workspace');
assert.strictEqual(isWithinRoot(root, root), true);
assert.strictEqual(isWithinRoot(root, path.join(root, 'src', 'file.js')), true);
assert.strictEqual(isWithinRoot(root, path.join(root, '..', 'workspace-evil', 'file.js')), false);
assert.strictEqual(isWithinRoot(root, path.join(root, '..', 'outside.js')), false);
