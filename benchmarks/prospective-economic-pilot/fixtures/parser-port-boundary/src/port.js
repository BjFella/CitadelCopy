'use strict';
function parsePort(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 3000;
}
module.exports = { parsePort };
