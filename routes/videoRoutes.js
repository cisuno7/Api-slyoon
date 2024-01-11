const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require("../Controllers/videocontrollers");
const path = require('path'); // Import path module for robust file paths
const fs = require('fs');
const verifyToken = require('../Middleware/VerifyToken');

// Construct upload directory path reliably
const uploadDirectory = path.join(__dirname, 'uploads');

// Create directory with error handling
try {
  fs.mkdirSync(uploadDirectory, { recursive: true });
} catch (err) {
  console.error('Error creating directory:', err);
  // Handle the error appropriately (e.g., send error response)
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

// Apply verification middleware to protected routes
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
