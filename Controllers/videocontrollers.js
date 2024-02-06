const multer = require('multer');
const { S3Client, PutObjectCommand,ListObjectsCommand } = require("@aws-sdk/client-s3");
const VideoModel = require('../Models/videos');
require('dotenv').config();

// Configuração do cliente AWS S3
const s3Client = new S3Client({

  endpoint: "https://play.min.io", // Endpoint do MinIO
  forcePathStyle: true, // Necessário para MinIO
  credentials: {
    accessKeyId: "minioadmin", // Substitua pelo seu accessKeyId do MinIO
    secretAccessKey: "minioadmin" // Substitua pelo seu secretAccessKey do MinIO
  }
});
const listBucketObjects = async () => {
  console.log("Nome do Bucket:", process.env.BUCKET_NAME)
  const bucketName = process.env.BUCKET_NAME; // Substitua pelo nome do seu bucket

  try {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    const response = await s3Client.send(command);
    console.log("Objetos no bucket:", response.Contents);
  } catch (error) {
    console.error("Erro ao listar objetos do bucket:", error);
  }
};

listBucketObjects();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mov' || file.mimetype === 'video/avi' || file.mimetype === 'video/webm' || file.mimetype === 'video/ogg') {
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
  console.log('Iniciando processamento de upload de vídeo');
  console.log('Dados do corpo da requisição (req.body):', req.body);
  console.log('Informações do arquivo (req.file):', req.file);
  
  if (!req.file) {
    console.log('Corpo da requisição raw:', req.rawBody);
  }
  try {
    const { title, description } = req.body;
    if (!req.file || !['video/mp4', 'video/mov', 'video/avi'].includes(req.file.mimetype)) {
      console.log('Formato de arquivo inválido ou arquivo ausente');
      return res.status(400).json({ message: 'Formato de arquivo inválido' });
    }

    // Upload do vídeo para o S3
    const bucketName = process.env.BUCKET_NAME;
    const videoPath = 'videos/' + req.file.originalname;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: videoPath,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
    await s3Client.send(command);
    

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
