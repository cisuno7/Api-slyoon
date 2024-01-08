const express = require('express');
const router = express.Router();
const videoController = require("../Controllers/videocontrollers");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Diretório de upload
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]); // Nome do arquivo
    }
});
const upload = multer({ storage: storage });

// Rota para upload de vídeo no servidor
router.post('/upload', upload.single('video'), [videoController].uploadVideo);
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