const express = require('express');
const router = express.Router();
const videoController = require('../Controllers/videocontrollers');
const verifyToken = require('../Middleware/VerifyToken');

// Rota de upload de vídeo que requer autenticação
router.post('/upload', verifyToken, videoController.uploadVideo, videoController.processVideoUpload);

// Rota de listagem de vídeos que requer autenticação
router.get('/videos', verifyToken, async (req, res) => {
  try {
    const videos = await VideoModel.getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).send('Erro ao listar vídeos');
  }
});

module.exports = router;
