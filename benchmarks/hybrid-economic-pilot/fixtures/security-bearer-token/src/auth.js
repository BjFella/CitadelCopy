'use strict';
function parseBearer(value) {
  if (typeof value !== 'string') return null;
  return value.split(' ')[1] || null;
}
module.exports = { parseBearer };
