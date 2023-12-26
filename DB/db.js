const sql = require('mssql');

const dbConfig = {
    user: 'sa', // Remova o espaço após 'sa'
    password: 'DJ8:W^0[rT.3', // Verifique se esta é a senha correta
    server: 'node163450-env-0304409.jelastic.saveincloud.net', // Use o host do SaveInCloud
    port: 13914, // Use a porta pública configurada no SaveInCloud
    database: 'user_db',
    options: {
        encrypt: true, // Pode ser necessário para conexões seguras, dependendo da configuração do servidor
        trustServerCertificate: true // True se estiver usando certificados autoassinados, false se não
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
