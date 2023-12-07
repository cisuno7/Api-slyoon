const sql = require('mssql');

const dbConfig = {
    user: 'Jordan3', 
    password: 'Ga771421', 
    server: 'LAPTOP-UH10NKQD', 
    database: 'user_db',
    options: {
        trustedConnection: true,
        encrypt: true,
        trustServerCertificate: true, 
        rejectUnauthorized: false
    }
};

const getConnection = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        return pool;
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error);
        throw error;
    }
};

module.exports = getConnection;
