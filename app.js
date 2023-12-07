const express = require('express');
const app = express();
const router = require('./routes/authRoutes');

app.use(express.json());
app.use('/api/auth', router);

// Outras configurações e middleware

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
