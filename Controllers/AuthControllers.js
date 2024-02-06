const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const generateToken = require('../Helpers/auth');
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

      // Gera o token JWT para o usuário autenticado
      const token = generateToken(user.ID);

      // Envio do token como parte da resposta
      res.send({ token: token });
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

const editarPerfil = async (req, res) => {
    try {
      // Verifique o token de autenticação e atribua o usuário autenticado à variável `req.user`
      const decoded = jwt.verify(req.headers['authorization'], process.env.JWT_SECRET);
      req.user = decoded;
  
      // Colete os dados do formulário
      const { username, name, description, avatarURL } = req.body;
  
      // Converta a foto para base64
      const avatarBase64 = base64url.encode(avatarURL);
  
      // Atualizar o perfil no banco de dados
      const updatedUser = await User.update(req.user.id, {
        username,
        name,
        description,
        avatarURL: avatarBase64,
      });
  
      res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const buscaUsuario = async (req, res) => {
    const { name } = req.query;
  
    try {
      const users = await User.find({
        name: { $regex: name, $options: 'i' },
      });
  
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
  };
  
  const forgotPassword = async (req, res) => {
    try {
      const email = req.body.email;
  
      // Verifique se o e-mail existe
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).send('E-mail não encontrado');
      }
      if (user) {
        return res.status(200).send('E-mail encontrado com sucesso!');
      }
      // Continue com a lógica de recuperação de senha
      // ...
    } catch (error) {
      console.error('Erro na função forgotPassword:', error);
      res.status(500).send('Erro interno do servidor');
    }
  };
  
  
module.exports = { login, register,editarPerfil,buscaUsuario,forgotPassword};
