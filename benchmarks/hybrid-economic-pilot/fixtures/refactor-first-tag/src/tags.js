'use strict';
function uniqueTags(tags) {
  return Array.from(new Set(tags));
}
module.exports = { uniqueTags };
