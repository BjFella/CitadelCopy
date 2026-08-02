'use strict';
function parseLegacy(text) {
  return JSON.parse(text);
}
module.exports = { parseLegacy };
