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

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mov' || file.mimetype === 'video/avi') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1048576000
  },
  fileFilter: fileFilter
});

// Middleware do Multer para processar o arquivo de vídeo
exports.uploadVideo = upload.single('videoFile');

// Função para lidar com a lógica de upload
exports.processVideoUpload = async (req, res) => {
  // Validação do arquivo de vídeo
  try {
    const {  title, description } = req.body;
    if (!req.file || !['video/mp4', 'video/mov', 'video/avi'].includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Formato de arquivo inválido' });
    }
    
    console.log(req.body)
    console.log(title);
    // Validate data
  
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
  }catch (error) {
    console.error('Falha durante o upload/salvamento:', error);
    res.status(500).json({ message: 'Falha ao processar o vídeo', error: error.message });
    }
    
};
