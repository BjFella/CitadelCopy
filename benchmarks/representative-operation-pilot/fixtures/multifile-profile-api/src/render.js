'use strict';
const { formatUser } = require('./format');

function renderProfile(user) {
  return `Profile: ${formatUser(user)}`;
}

module.exports = { renderProfile };
