const sql = require('mssql');

const config = {
  user: 'sa',                
  password: 'Zing@123',  
  server: 'localhost',       
  database: 'ZHRProposalEngine',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect
};