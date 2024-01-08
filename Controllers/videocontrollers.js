// controllers/VideoController.js
const VideoModel = require('../models/VideoModel');

exports.uploadVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const uploaderId = req.user.id; 
        const videoPath = req.file.path;

        await VideoModel.saveVideoInfo({ title, description, uploaderId, videoPath });
        res.status(200).send({ message: 'Vídeo carregado com sucesso', videoPath });
    } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
        res.status(500).send('Erro ao carregar vídeo');
    }
};
