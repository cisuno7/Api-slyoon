const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../Models/User");
require("dotenv").config();

const login = async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      return res.status(400).send("Usuário não encontrado.");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.Password
    );
    if (!validPassword) {
      return res.status(400).send("Senha incorreta.");
    }
    // Gere o token JWT COM HEADER
    const token = jwt.sign(
      {
        id: user.ID,
        iat: Math.floor(Date.now() / 1000), // Timestamp de emissão
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        header: { typ: "JWT" }, // Header com tipo JWT
      }
    );
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

const editarPerfil = async (req, res) => {
  try {
    // Verifique o token de autenticação e atribua o usuário autenticado à variável `req.user`
    const decoded = jwt.verify(
      req.headers["authorization"],
      process.env.JWT_SECRET
    );
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

    res.status(200).json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const buscaUsuario = async (req, res) => {
  const { name } = req.query;

  try {
    const users = await User.find({
      name: { $regex: name, $options: "i" },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    // Verifique se o e-mail existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).send("E-mail não encontrado");
    }

    const resetToken = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, {
      expiresIn: "1h", // token expira em 1 hora
    });
    await sendResetPasswordEmail(email, resetToken);

    console.log("email de recuperação enviado com sucesso!");
    return res.status(200).send("email de recuperação enviado com sucesso!");
  } catch (error) {
    console.error("Erro na função forgotPassword:", error);
    res.status(500).send("Erro interno do servidor");
  }
};

async function sendResetPasswordEmail(userMail, reseToken) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "robertosouzajr7@gmail.com",
      pass: "vjpdwrpictjzqokd",
    },
  });

  const resetUrl = `http://localhost:8081/reset-password`;

  try {
    await transporter.sendMail({
      from: `"Slyoon" ${process.env.SMTP_EMAIL}`,
      to: userMail,
      subject: "Redefinição de senha",
      text: "Você solicitou a redefinição de senha. Porfavor use o seguinte link para redefini-la:",
      html: `<p>Clique aqui pra refefinir sua senha:<a href="${resetUrl}/${reseToken}" target="_blank"></p>`,
    });
    console.log("email de refinição de senha enviado com sucesso!");
  } catch (error) {
    console.log(`Erro ao enviar email: ${error}`);
  }
}

module.exports = {
  login,
  register,
  editarPerfil,
  buscaUsuario,
  forgotPassword,
  sendResetPasswordEmail,
};
