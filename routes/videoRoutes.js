const express = require('express');
const router = express.Router();
const videoController = require('../Controllers/videocontrollers');
const verifyToken = require('../Middleware/VerifyToken');
const listVideosAndGenerateSignedUrls = require('../Controllers/videocontrollers');
``

// Rota de upload de vídeo que requer autenticação
router.post('/upload', verifyToken, videoController.uploadVideo, videoController.processVideoUpload);
router.get('/videos', async (req, res) => {
  const { success, urls, message } = await videoController.listVideosAndGenerateSignedUrls();
  if (success) {
    res.json(urls);
  } else {
    res.status(500).send(message);
  }
});



module.exports = router;
