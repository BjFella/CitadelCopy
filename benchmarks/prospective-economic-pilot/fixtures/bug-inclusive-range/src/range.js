'use strict';
function isWithinRange(value, minimum, maximum) {
  return value > minimum && value < maximum;
}
module.exports = { isWithinRange };
