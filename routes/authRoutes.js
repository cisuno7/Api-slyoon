const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthControllers'); 
// Rotas que necessitam de autenticação
router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/editar-perfil', authController.editarPerfil);
router.get('/busca-usuario', authController.buscaUsuario);
  
module.exports = router;
