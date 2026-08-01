'use strict';

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return min;
  return value;
}

module.exports = { clamp };
