const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes'); 
const videoRoutes = require('./routes/videoRoutes');
require('dotenv').config();
app.use(express.json());
const verifyToken = require('./Middleware/VerifyToken');
app.use(cors());
app.use('/api/auth', authRoutes);
app.use(verifyToken);
app.use('/api/video',videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
