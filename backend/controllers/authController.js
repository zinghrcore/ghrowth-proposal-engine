const { pool, poolConnect } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure DB connection
    await poolConnect;

    // Fetch user by email
    const result = await pool.request()
      .input('email', email)
      .query(`
        SELECT *
        FROM zhrCustomer
        WHERE custCHROEmail = @email
      `);

    const rows = result.recordset;

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Normalize role
    let role = user.role ? user.role.toString().trim().toLowerCase() : 'customer';

    if (!['admin', 'approver', 'customer'].includes(role)) {
      role = 'customer';
    }

    // Send response
    res.json({
      message: 'Login successful',
      user: {
        custId: user.custId,
        custName: user.custName,
        email: user.custCHROEmail,
        role,
        custType: user.custType,
        custRegion: user.custRegion,
      },
    });

  } catch (err) {

    console.error('Login Error:', err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });

  }
};