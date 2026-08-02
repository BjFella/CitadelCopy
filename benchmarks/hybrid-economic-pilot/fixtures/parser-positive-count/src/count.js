'use strict';
function parseCount(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 1;
}
module.exports = { parseCount };
