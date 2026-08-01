'use strict';
const path = require('path');

function isWithinRoot(root, candidate) {
  return path.resolve(candidate).startsWith(path.resolve(root));
}

module.exports = { isWithinRoot };
