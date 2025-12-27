const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',        // your MySQL username
  password: 'Zing@123',        // your MySQL password (keep empty if none)
  database: 'zhrproposalengine'  // your database name
});

module.exports = db;
