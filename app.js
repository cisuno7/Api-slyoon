const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();


const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("dotenv").config();
app.use(express.json());

app.use(cors());
app.use("/api/auth", authRoutes);

app.use("/api/video", videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
