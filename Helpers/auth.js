const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 3600
  };

  return jwt.encode(payload, process.env.JWT_SECRET);
};

module.exports = generateToken;