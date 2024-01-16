const VideoModel = require('../Models/videos');
const Minio = require('minio');
const minioClient = new Minio.Client({
  endPoint: 'play.min.io',
  port: 9000,
  accessKey: '2QQxHECsr4',
  useSSL: true,
  secretKey: 'Hz6jqIIab2'
});

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const uploaderId = req.user.id;
    const videoFile = req.file; // Get the uploaded video file

    // Validate data
    if (!title || title.length < 3) {
      throw new Error('O título do vídeo deve ter pelo menos 3 caracteres.');
    }

    if (!description || description.length < 10) {
      throw new Error('A descrição do vídeo deve ter pelo menos 10 caracteres.');
    }

    // Upload the video to Minio
    const nomeDoBucket = 'Videos'; // Seu nome de bucket atual

    const caminhoDoVideoNoMinio = 'videos/' + videoFile.originalname;

// Upload the video to Minio
await minioClient.putObject(bucketName, 'videos/' + videoFile.originalname, videoFile);


    // Save video information to the database (using Minio path)
    await VideoModel.saveVideoInfo({
      title,
      description,
      uploaderId,
      videoPath: videoPathOnMinio
    });

    res.status(201).json({ message: 'Vídeo enviado com sucesso!' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erro ao carregar vídeo.';
    res.status(statusCode).send(message);
  }
};
