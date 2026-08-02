'use strict';
function isLocalRedirect(value) {
  return typeof value === 'string' && value.startsWith('/');
}
module.exports = { isLocalRedirect };
