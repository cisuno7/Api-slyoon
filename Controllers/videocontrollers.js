const multer = require('multer');
const Minio = require('minio');
const VideoModel = require('../Models/videos');

// Configuração do cliente Minio
const minioClient = new Minio.Client({
  endPoint: 'play.min.io',
  port: 9000,
  accessKey: 'Q3AM3UQ867SPQQA43P2F',
  secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
  useSSL: true,
  rejectUnauthorized: false

});

// Configuração do Multer
// Configuração do Multer
const upload = multer({
  storage: multer.memoryStorage(),
  maxFileSize: 1048576000, // <-- Adicione a vírgula aqui
  allowedMimeTypes: [
    'video/mp4',
    'video/mov',
    'video/avi'
  ]
});


// Middleware do Multer para processar o arquivo de vídeo
exports.uploadVideo = upload.single('videoFile');

// Função para lidar com a lógica de upload
exports.processVideoUpload = async (req, res) => {
  // Validação do arquivo de vídeo
  try {
    const {  title, description } = req.body;

    console.log(req.body)
    console.log(title);
    // Validate data
    
    if (!description || description.length < 10) {
      throw new Error('A descrição do vídeo deve ter pelo menos 10 caracteres.');
    }
console.log(description);
    // Upload do vídeo para o Minio
    const bucketName = 'bookings';
    const caminhoDoVideoNoMinio = 'bookings/' + req.file.originalname;
    await minioClient.putObject(bucketName, caminhoDoVideoNoMinio, req.file.buffer);

    // Salvar informações do vídeo no banco de dados
    await VideoModel.saveVideoInfo({
      title,
      description,
      uploaderId: req.user.id, // ID do usuário
      videoPath: caminhoDoVideoNoMinio
    });

    res.status(201).json({ message: 'Vídeo enviado com sucesso!' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
