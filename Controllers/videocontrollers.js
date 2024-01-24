const multer = require('multer');
const AWS = require('aws-sdk');
const VideoModel = require('../Models/videos');

// Configuração do cliente AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mov' || file.mimetype === 'video/avi') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1048576000 },
  fileFilter: fileFilter
});

// Middleware do Multer para processar o arquivo de vídeo
exports.uploadVideo = upload.single('videoFile');

// Função para lidar com a lógica de upload
exports.processVideoUpload = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file || !['video/mp4', 'video/mov', 'video/avi'].includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Formato de arquivo inválido' });
    }

    // Upload do vídeo para o S3
    const bucketName = process.env.BUCKET_NAME;
    const videoPath = 'videos/' + req.file.originalname;
    await s3.putObject({
      Bucket: bucketName,
      Key: videoPath,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();

    // Salvar informações do vídeo no banco de dados
    await VideoModel.saveVideoInfo({
      title,
      description,
      uploaderId: req.user.id,
      videoPath: videoPath
    });

    res.status(201).json({ message: 'Vídeo enviado com sucesso!' });
  } catch (error) {
    console.error('Falha durante o upload/salvamento:', error);
    res.status(500).json({ message: 'Falha ao processar o vídeo', error: error.message });
  }
};
