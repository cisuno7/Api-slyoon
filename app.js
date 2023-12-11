const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes'); 
require('dotenv').config();

app.use(express.json());


app.use('/api/auth', authRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
