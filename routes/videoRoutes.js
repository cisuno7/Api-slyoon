const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../Controllers/videocontrollers');
const path = require('path'); // Importa o módulo path para caminhos de arquivos robustos
const fs = require('fs');
const verifyToken = require('../Middleware/VerifyToken');

// Constrói o caminho do diretório de upload de forma confiável
const uploadDirectory = path.join(__dirname, 'uploads');

// Cria o diretório com tratamento de erros
try {
  fs.mkdirSync(uploadDirectory, { recursive: true });
} catch (err) {
  console.error('Erro ao criar o diretório:', err);
  // Trate o erro de forma apropriada (por exemplo, envie uma resposta de erro)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({ storage: storage });

// Aplica o middleware de verificação às rotas protegidas
router.post('/upload', verifyToken, upload.single('video_file'), videoController.uploadVideo);

// routes/tiktokRoutes.js
router.get('/videos', async (req, res) => {
  try {
    const videos = await VideoModel.getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).send('Erro ao listar vídeos');
  }
});

module.exports = router;
