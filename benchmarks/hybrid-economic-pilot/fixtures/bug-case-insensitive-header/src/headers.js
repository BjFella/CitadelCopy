'use strict';
function readHeader(entries, name) {
  if (!Array.isArray(entries) || typeof name !== 'string') return null;
  const found = entries.find((entry) => entry.name === name);
  return found ? found.value : null;
}
module.exports = { readHeader };
