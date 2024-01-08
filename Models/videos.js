// models/VideoModel.js
const sql = require('mssql');
const getConnection = require('../DB/db');

class VideoModel {
    static async saveVideoInfo({ title, description, uploaderId, videoPath }) {
        const pool = await getConnection();
        await pool.request()
            .input('title', sql.VarChar, title)
            .input('description', sql.VarChar, description)
            .input('uploaderId', sql.Int, uploaderId)
            .input('videoPath', sql.VarChar, videoPath)
            .query('INSERT INTO tb_slyoon_video_upload (Title, Description, UploaderID, VideoPath) VALUES (@title, @description, @uploaderId, @videoPath)');
    }

    static async getAllVideos() {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM tb_slyoon_video_upload');
        return result.recordset;
    }
}

module.exports = VideoModel;
