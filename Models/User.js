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
    static async createUser({ name, email, password, identityDocument = '00000000', documentType = 'default', nationality = 'default', phoneNumber = '0000000000' }) {
        try {
            const pool = await getConnection();
            
            
            const hashedPassword = await bcrypt.hash(password, 10);
    
       
            await pool.request()
                .input('name', sql.VarChar, name)
                .input('email', sql.VarChar, email)
                .input('password', sql.VarChar, hashedPassword)
                .input('identityDocument', sql.VarChar, identityDocument)
                .input('documentType', sql.VarChar, documentType)
                .input('nationality', sql.VarChar, nationality)
                .input('phoneNumber', sql.VarChar, phoneNumber)
                .input('createdAt', sql.DateTime, new Date()) 
                .input('lastAccess', sql.DateTime, new Date()) 
                .input('active', sql.Bit, 1)
                .query('INSERT INTO tb_users (Name, Email, Password, IdentityDocument, DocumentType, Nationality, PhoneNumber, CreatedAt, LastAccess, Active) VALUES (@name, @email, @password, @identityDocument, @documentType, @nationality, @phoneNumber, @createdAt, @lastAccess, @active)');
    
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }
    static async update(id, data) {
        try {
          const pool = await getConnection();
          await pool.request()
            .input('id', sql.Int, id)
            // Adicione os demais campos a serem atualizados
            .query(`UPDATE tb_users SET ${Object.keys(data).map(key => `${key} = @${key}`).join(', ')} WHERE ID = @id`);
        } catch (error) {
          console.error('Erro ao atualizar usuário:', error);
          throw error;
        }
      }
      static async find( ) {
        try {
          const pool = await getConnection();
          const result = await pool.request()
            .query(
              `SELECT Name FROM tb_users`,
              
            );
          return result.recordset;
        } catch (error) {
          console.error('Erro ao buscar usuários:', error);
          throw error;
        }
      }
    
}    

module.exports = User;
