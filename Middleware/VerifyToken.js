const jwt = require('jsonwebtoken');

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
    return res.status(401).send('Token inválido: header Authorization não definido');
  }

  const parts = tokenRequest.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.error('Token inválido: formato incorreto no header Authorization');
    return res.status(401).send('Token inválido: formato incorreto no header Authorization');
  }

  const token = parts[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    req.user = jwt.decode(token); // assuming payload contains user information
    next();
  } catch (error) {
    logger.error(`Erro na verificação do token: ${error.message}`);
    return res.status(401).send(`Erro na verificação do token: ${error.message}`);
  }
};
  
module.exports = verifyToken;
