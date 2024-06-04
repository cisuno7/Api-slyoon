const sql = require("mssql");
const getConnection = require("../DB/db");
const User = require("../Models/User");

class Transaction {
    static async infoBankUser({
        email,
        accountNumber,
        bankName,
        accountType,
        country,
        swiftCode, 
        IBAN,
        routingNumber, 
        branchName, 
        branchAddress
    }) {
        try {
            const pool = await getConnection();
            const emailExist = User.findByEmail(email);

            if (emailExist == null) {
                console.error("Email não cadastrado");
            } else {
                const userId = emailExist.Id;

                await pool
                .request()
                .input("userId", sql.Int, userId)
                .input("accountNumber", sql.Int, accountNumber)
                .input("bankName", sql.VarChar, bankName)
                .input("accountType", sql.VarChar, accountType)
                .input("country", sql.VarChar, country)
                .input("swiftCode", sql.NVarChar, swiftCode)
                .input("IBAN", sql.NVarChar, IBAN)
                .input("routingNumber", sql.NVarChar, routingNumber)
                .input("branchName", sql.NVarChar, branchName)
                .input("branchAddress", sql.NVarChar, branchAddress)
                .input("cacheDolar", sql.Float, 0.0)
                .input("dateWithdrawal1", sql.DateTime, new Date())
                .input("dateWithdrawal2", sql.DateTime, new Date())
                .input("amountWithdrawal1", sql.Float, 0.0)
                .input("amountWithdrawal2", sql.Float, 0.0)
                .input("resetToken", sql.VarChar, "")
                .input("resetTokenExpires", sql.VarChar, "")
                .query(
                    "INSERT INTO tb_bank_info (UserId, AccountNumber, BankName, AccountType, Country, SwiftCode, IBAN, RoutingNumber, BranchName, BranchAddress, CacheDolar, DateWithdrawal1, DateWithdrawal2, AmountWithdrawal1, AmountWithdrawal2, ResetToken, ResetTokenExpires) VALUES (@userId, @accountNumber, @bankName, @accountType, @country, @swiftCode, @IBAN, @routingNumber, @branchName, @branchAddress, @cacheDolar, @dateWithdrawal1, @dateWithdrawal2, @amountWithdrawal1, @amountWithdrawal2, @resetToken, @resetTokenExpires)"
                );
            }
            
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            throw error;
        }
    }
}