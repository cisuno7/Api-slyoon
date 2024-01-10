const jwt = require('jsonwebtoken');
const generateToken = require('../helpers/auth');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

const verifyToken = (req, res, next) => {
  const tokenRequest = req.headers['authorization'];

  if (!tokenRequest) {
    logger.error('Token inválido: header Authorization não definido');
    throw new Error('Token inválido');
  }

  const parts = tokenRequest.split(' ');
  if (parts.length !== 2) {
    logger.error('Token inválido: header Authorization incorreto');
    throw new Error('Token inválido');
  }

  const method = parts[0];
  const tokenType = parts[1];

  if (method !== 'Bearer') {
    logger.error('Token inválido: método Authorization incorreto');
    throw new Error('Token inválido');
  }

  try {
    // Verifica o formato básico do token
    const decoded = jwt.decode(tokenType);
    if (!decoded) {
      logger.error('Token inválido: formato incorreto');
      throw new Error('Token inválido');
    }

    // Verifica o tipo do token
    if (decoded.header && decoded.header.typ !== 'JWT') {
      logger.error('Token inválido: tipo incorreto');
      throw new Error('Token inválido');
    }

    // Verifica se o token é um objeto null
    if (decoded === null) {
      logger.error('Token inválido: token não decodificado corretamente');
      throw new Error('Token inválido');
    }

    // Verifica a assinatura
    const verified = jwt.verify(tokenType, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.error('Token expirado');
      return res.status(401).send('Token expirado');
    } else {
      logger.error(error);
      return res.status(401).send('Token inválido');
    }
  }
};

  
module.exports = verifyToken;
