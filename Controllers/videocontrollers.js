// controllers/VideoController.js
const VideoModel = require('../Models/videos');

exports.uploadVideo = async (req, res) => {
    try {
      const { title, description } = req.body;
      const uploaderId = req.user.id;
      const videoPath = req.file.path;
  
      // Validação de dados
      if (!title || title.length < 3) {
        throw new Error('O título do vídeo deve ter pelo menos 3 caracteres.');
      }
  
      if (!description || description.length < 10) {
        throw new Error('A descrição do vídeo deve ter pelo menos 10 caracteres.');
      }

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Erro ao carregar vídeo.';
        res.status(statusCode).send(message);
    }
  };