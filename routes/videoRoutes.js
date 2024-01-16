
const videoController = require('../Controllers/videocontrollers');
const express = require('express');
const router = express.Router();

router.post('/upload', videoController.uploadVideo);


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
