'use strict';
function normalizeStatus(value) {
  if (typeof value !== 'string') return 'unknown';
  return value.trim();
}
module.exports = { normalizeStatus };
