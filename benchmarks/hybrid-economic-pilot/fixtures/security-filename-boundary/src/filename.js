'use strict';
function isSafeFilename(value) {
  return typeof value === 'string' && value.length > 0 && !value.includes('/');
}
module.exports = { isSafeFilename };
