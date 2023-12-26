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
        console.error("Erro durante o login:", err);  
        res.status(500).send("Erro no servidor: " + err.message);
    }
};

const register = async (req, res) => {
    try {
        console.log("Dados recebidos no registro:", req.body);
        
       
        const userExists = await User.findByEmail(req.body.email);
        if (userExists) {
            return res.status(400).send("Email já cadastrado.");
        }

        await User.createUser(req.body);
        res.send("Usuário registrado com sucesso.");
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        res.status(500).send("Erro ao registrar usuário: " + err.message);
    }
};


module.exports = { login, register };
