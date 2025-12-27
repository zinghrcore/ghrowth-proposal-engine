const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Register new customer (or approver/admin)
exports.registerCustomer = async (req, res) => {
  try {
    const {
      custName,
      custCHRO,
      custCHROEmail,
      custCHROPhone,
      custRegion,
      custAddress,
      password,
      custType // "customer", "approver", or "admin" from frontend
    } = req.body;

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role safely
    let role = 'customer'; // default
    if (custType && typeof custType === 'string') {
      const type = custType.toLowerCase().trim();
      if (type === 'approver') role = 'approver';
      else if (type === 'admin') role = 'admin';
    }

    // Insert into database
    const query = `
      INSERT INTO zhrCustomer 
      (custName, custCHRO, custCHROEmail, custCHROPhone, custRegion, custAddress, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      custName,
      custCHRO,
      custCHROEmail,
      custCHROPhone,
      custRegion,
      custAddress,
      hashedPassword,
      role
    ]);

    res.status(201).json({ message: 'Registration successful', role });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
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

    // Use role safely from database
    let role = user.role ? user.role.toString().trim().toLowerCase() : 'customer';
    if (!['admin', 'approver', 'customer'].includes(role)) {
      role = 'customer';
    }

    // Send response (no password)
    res.json({
      message: 'Login successful',
      user: {
        id: user.custId,
        custName: user.custName,
        email: user.custCHROEmail,
        role, // ✅ Correct normalized role
        custType: user.custType,
        custRegion: user.custRegion,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
