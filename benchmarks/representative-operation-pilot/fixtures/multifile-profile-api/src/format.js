'use strict';

function formatUser(user) {
  return `${user.name} <${user.email}>`;
}

module.exports = { formatUser };
