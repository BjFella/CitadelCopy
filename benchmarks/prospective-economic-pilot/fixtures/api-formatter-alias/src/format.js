'use strict';
function formatLegacy(item) {
  return `${item.id}: ${item.label}`;
}
module.exports = { formatLegacy };
