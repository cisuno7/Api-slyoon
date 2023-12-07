const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const login = async (req, res) => {
    try {
        const user = await User.findByEmail(req.body.email);
        if (!user) {
            return res.status(400).send("Usuário não encontrado.");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.Password);
        if (!validPassword) {
            return res.status(400).send("Senha incorreta.");
        }

        // Gere o token JWT
        const token = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (err) {
        res.status(500).send("Erro no servidor.");
    }
};

const register = async (req, res) => {
    try {
        const { email, ...userData } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).send("Usuário já existe.");
        }

        await User.createUser(userData);
        res.send("Usuário registrado com sucesso.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no servidor.");
    }
};
module.exports = { login, register };
