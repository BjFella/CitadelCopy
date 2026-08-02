'use strict';
function safeHeaderValue(value) {
  if (typeof value !== 'string') return null;
  return value.replace(/[\r\n]/g, '');
}
module.exports = { safeHeaderValue };
