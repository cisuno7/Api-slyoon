const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; 

    if (!token) {
        return res.status(403).send("Um token é necessário para a autenticação");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Token inválido");
    }

    return next();
};

module.exports = verifyToken;
