const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require("../Controllers/videocontrollers");
const fs = require('fs');
const verifyToken = require('../Middleware/VerifyToken');
// Diretório para uploads
const uploadDirectory = 'uploads/';

// Verifique se o diretório existe, se não, crie
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use o diretório comum para todos os uploads
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        // Gere um nome de arquivo único
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

const upload = multer({ storage: storage });

// Rota para upload de vídeo no servidor
router.post('/upload', upload.single('video_file'), videoController.uploadVideo);

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
