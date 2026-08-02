'use strict';
function uniqueById(items) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}
module.exports = { uniqueById };
