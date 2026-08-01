'use strict';

function dedupe(values) {
  return [...new Set(values.map(String))];
}

module.exports = { dedupe };
