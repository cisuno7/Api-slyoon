const express = require('express');
const app = express();
const multer = require('multer');
const authRoutes = require('./routes/authRoutes'); 
const videoRoutes = require('./routes/videoRoutes');
require('dotenv').config();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/video',videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
