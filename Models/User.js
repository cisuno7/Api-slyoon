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
            if (!name || !email || !password || !identityDocument || !documentType || !nationality || !phoneNumber) {
                throw new Error("Todos os campos são obrigatórios1.");
            }
    
            console.log("Senha recebida:", password);
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const pool = await getConnection();
            await pool.request()
            .input('name', sql.VarChar, name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('identityDocument', sql.VarChar, identityDocument)
            .input('documentType', sql.VarChar, documentType) 
            .input('nationality', sql.VarChar, nationality) 
            .input('phoneNumber', sql.VarChar, phoneNumber) 
            .query('INSERT INTO tb_users (Name, Email, Password, IdentityDocument, DocumentType, Nationality, PhoneNumber) VALUES (@name, @email, @password, @identityDocument, @documentType, @nationality, @phoneNumber)');
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }
}    

module.exports = User;
