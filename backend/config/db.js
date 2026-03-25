const sql = require('mssql');

const config = {
  user: 'Temp',                
  password: 'Temp@123',  
  server: '172.16.68.4',       
  database: 'zhrproposalengine',
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