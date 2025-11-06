const crypto = require('crypto');

function generateShareToken(len = 18) {
  return crypto.randomBytes(len).toString('base64url');
}

module.exports = { generateShareToken };

