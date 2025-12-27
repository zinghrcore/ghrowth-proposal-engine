const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const [rows] = await db.query('SELECT * FROM zhrCustomer WHERE custCHROEmail = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Use role directly from database
    let role = user.role ? user.role.toString().trim().toLowerCase() : 'customer';
    if (!['admin', 'approver', 'customer'].includes(role)) {
      role = 'customer';
    }

    // Send response with correct role
    res.json({
      message: 'Login successful',
      user: {
        custId: user.custId,
        custName: user.custName,
        email: user.custCHROEmail,
        role, // ✅ Correct role now
        custType: user.custType,
        custRegion: user.custRegion,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
