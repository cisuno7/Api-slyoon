const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


const VideoModel = require('../Models/videos');
require('dotenv').config();

// Configuração do cliente AWS S3
const s3Client = new S3Client({
  endpoint: "http://env-6860159.jelastic.saveincloud.net/", 
  region: "us-east-1", 
  credentials: {
    accessKeyId: "wJVUF4S7TVV7r21T", 
    secretAccessKey: "RP476d0GpVkTFSIxg3JB4OUZNjnYgUuU" 
  },
  forcePathStyle: true, 
});


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1048576000 },
  fileFilter: (req, file, cb) => {
    if (['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/ogg'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'), false);
    }
  }
});

exports.uploadVideo = upload.single('videoFile');

exports.processVideoUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo de vídeo fornecido.' });
  }

  // Dados do corpo da requisição
  const { title, description } = req.body;

  try {
    // Upload do vídeo para o S3
    const videoPath = `videos/${req.file.originalname}`;
    const uploadResult = await uploadToS3(req.file, videoPath);

    if (!uploadResult.success) {
      // Se o upload falhar, retorna um erro específico
      return res.status(500).json({ message: uploadResult.message });
    }

    // Salvar informações do vídeo no banco de dados
    const dbSaveResult = await saveVideoInfo({
      title,
      description,
      uploaderId: req.user.id, // Assumindo que este ID vem de um middleware de autenticação
      videoPath: uploadResult.path,
    });

    if (!dbSaveResult.success) {
      // Se o salvamento no banco falhar, retorna um erro específico
      return res.status(500).json({ message: dbSaveResult.message });
    }

    // Sucesso
    res.status(201).json({ message: 'Vídeo enviado com sucesso!' });

  } catch (error) {
    // Tratamento de erro genérico
    console.error('Erro no processo de upload:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

async function uploadToS3(file, path) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);
    return { success: true, path };
  } catch (error) {
    console.error('Falha ao fazer upload para o S3:', error);
    return { success: false, message: 'Falha ao fazer upload para o S3.' };
  }
}

async function saveVideoInfo(videoData) {
  try {
    // Assumindo que VideoModel.saveVideoInfo é uma função assíncrona
    await VideoModel.saveVideoInfo(videoData);
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar informações do vídeo no banco de dados:', error);
    return { success: false, message: 'Erro ao salvar informações no banco de dados.' };
  }
}


// Definindo e exportando a função assíncrona diretamente
console.log('BUCKET_NAME:', process.env.BUCKET_NAME); // Verificar o valor da variável de ambiente

exports.listVideosAndGenerateSignedUrls = async () => {
  try {
    console.log('Iniciando listagem de vídeos...'); // Log para indicar o início da operação
    const command = new ListObjectsCommand({
      Bucket: process.env.BUCKET_NAME,
      Prefix: "videos/",
    });

    const { Contents } = await s3Client.send(command);
    console.log(`Encontrados ${Contents.length} arquivos.`); // Log para mostrar a quantidade de arquivos encontrados

    const urls = await Promise.all(
      Contents.map(async (file) => {
        const url = await getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: file.Key,
        }), { expiresIn: 3600 });
        return { url, key: file.Key };
      })
    );

    console.log('URLs geradas com sucesso.'); // Log para confirmar a geração das URLs
    return { success: true, urls };
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    return { success: false, message: 'Erro ao listar vídeos.' };
  }
};