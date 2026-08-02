'use strict';
const { parseLegacy } = require('./parser');
function loadRecord(text) {
  return parseLegacy(text);
}
module.exports = { loadRecord };
