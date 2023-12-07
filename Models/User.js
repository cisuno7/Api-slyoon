const sql = require('mssql');
const getConnection = require('../DB/db'); // Ajuste o caminho conforme necessário
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await getConnection();
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            // Outros campos...
            .query('INSERT INTO tb_users (Name, Email, Password, IdentityDocument, DocumentType, Nationality, PhoneNumber) VALUES (@name, @email, @password, @identityDocument, @documentType, @nationality, @phoneNumber)');
    }

    
}

module.exports = User;
