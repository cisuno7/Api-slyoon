const sql = require('mssql');
const getConnection = require('../DB/db'); 
const bcrypt = require('bcrypt');

class User {
    static async findByEmail(email) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM tb_users WHERE Email = @email');
        return result.recordset[0];
    }
    static async createUser({ name, email, password, identityDocument, documentType, nationality, phoneNumber }) {
        try {
            const pool = await getConnection();
            
          
            // Se não existir, prosseguir com a criação do usuário
            console.log("Senha recebida:", password);
            const hashedPassword = await bcrypt.hash(password, 10);
    
            await pool.request()
                .input('name', sql.VarChar, name)
                .input('email', sql.VarChar, email)
                .input('password', sql.VarChar, hashedPassword)
                .input('identityDocument', sql.VarChar, identityDocument)
                .query('INSERT INTO tb_users (Name, Email, Password) VALUES (@name, @email, @password)');
    
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }
    
}    

module.exports = User;
