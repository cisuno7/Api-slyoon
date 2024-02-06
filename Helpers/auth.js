// auth.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const payload = {
    id: userId,
    iat: Math.floor(Date.now() / 1000), // Momento de emissão do token
    exp: Math.floor(Date.now() / 1000) + (3600 * 8) // Expira em 4 horas
  };

  // Assina o token com a chave secreta
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

module.exports = generateToken;
