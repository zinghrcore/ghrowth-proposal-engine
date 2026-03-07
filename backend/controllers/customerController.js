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
      custType, // "customer", "approver", or "admin" from frontend
    } = req.body;

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 1️⃣ Determine role safely
    let role = "customer"; // default
    if (custType && typeof custType === "string") {
      const type = custType.toLowerCase().trim();
      if (type === "approver") role = "approver";
      else if (type === "admin") role = "admin";
    }

    // ✅ 2️⃣ Auto-assign region if not provided for approvers
    // ✅ 2️⃣ Auto-assign region if not provided for approvers
let regionToSave = custRegion;

if (role === "approver") {
  const name = (custName || "").toLowerCase();

  // Map approvers to regions
  if (name.includes("prasad")) {
    regionToSave = "Global"; // Prasad covers all regions for special approvals
  } else if (name.includes("chandru") || name.includes("chandra")) {
    regionToSave = "Middle East & Africa";
  } else if (name.includes("rajat")) {
    regionToSave = "South East Asia";
  } else if (name.includes("rohan")) {
    regionToSave = "India";
  } else {
    regionToSave = "India"; // default fallback
  }
}

    // ✅ 3️⃣ Insert into DB
    const query = `
      INSERT INTO zhrcustomer 
      (custName, custCHRO, custCHROEmail, custCHROPhone, custRegion, custAddress, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      custName,
      custCHRO,
      custCHROEmail,
      custCHROPhone,
      regionToSave,
      custAddress,
      hashedPassword,
      role,
    ]);

    res
      .status(201)
      .json({ message: "Registration successful", role, region: regionToSave });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const [rows] = await db.query('SELECT * FROM zhrcustomer WHERE custCHROEmail = ?', [email]);

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

// ✅ New: Update customer region
exports.updateRegion = async (req, res) => {
  try {
    const { custId, region } = req.body;

    if (!custId || !region) {
      return res.status(400).json({ error: "custId and region are required" });
    }

    const query = "UPDATE zhrcustomer SET custRegion = ? WHERE custId = ?";
    await db.query(query, [region, custId]);

    res.json({ message: "Region updated successfully" });
  } catch (err) {
    console.error("Update Region Error:", err);
    res.status(500).json({ error: "Failed to update region" });
  }
};

// Save client information, pricing, and contact details
exports.saveClientInformation = async (req, res) => {
  try {
    const {
      custName,
      industry,
      whiteCollar,
      blueCollar,
      contract,
      otherEmployees, // optional
      selectedPlan,
      rateINR,
      rateUSD,
      implementationFee,
      custRegion,
      custAddress,
      // Client SPOC
      clientName,
      clientEmail,
      clientMobile,
      // ZingHR SPOC
      zinghrName,
      zinghrEmail,
      zinghrMobile,
      custCHRO,
      custCHROPhone,
      custCHROEmail,
    } = req.body;

    console.log("📩 Received client info:", req.body);

    // 1️⃣ Insert into zhrcustomer
    const customerQuery = `
      INSERT INTO zhrcustomer 
      (custName, custRegion, custAddress, custCHRO, custCHROPhone, custCHROEmail, empCountWhite, empCountBlue, empContract, empOther, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'customer')
    `;

    const [result] = await db.query(customerQuery, [
      custName,
      custRegion || "India",
      custAddress || "",
      custCHRO || "",
      custCHROPhone || "",
      custCHROEmail || "",
      whiteCollar || 0,
      blueCollar || 0,
      contract || 0,
      otherEmployees || 0,
    ]);

    const custId = result.insertId;
    console.log("✅ Customer inserted:", custId);

    // 2️⃣ Insert Client SPOC into a separate table (optional)
    if (clientName && clientEmail) {
      const clientSPOCQuery = `
        INSERT INTO zhrcustomer_spoc
        (custId, spocName, spocEmail, spocPhone, type)
        VALUES (?, ?, ?, ?, 'client')
      `;
      await db.query(clientSPOCQuery, [
        custId,
        clientName,
        clientEmail,
        clientMobile || "",
      ]);
      console.log("✅ Client SPOC saved");
    }

    // 3️⃣ Insert ZingHR SPOC
    if (zinghrName && zinghrEmail) {
      const zinghrSPOCQuery = `
        INSERT INTO zhrcustomer_spoc
        (custId, spocName, spocEmail, spocPhone, type)
        VALUES (?, ?, ?, ?, 'zinghr')
      `;
      await db.query(zinghrSPOCQuery, [
        custId,
        zinghrName,
        zinghrEmail,
        zinghrMobile || "",
      ]);
      console.log("✅ ZingHR SPOC saved");
    }

    // 4️⃣ Map selected plan to modId
    let modId = 1;
    if (selectedPlan === "ZingHR Pro") modId = 1;
    else if (selectedPlan === "ZingHR Pro Plus") modId = 2;
    else if (selectedPlan === "ZingHR GHROWTH") modId = 3;

    // 5️⃣ Insert into zhrmodcustpricing using custId
    const pricingQuery = `
      INSERT INTO zhrmodcustpricing (modId, custTypeId, PriceINR, PriceUSD)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(pricingQuery, [
      modId,
      custId,
      rateINR || 0,
      rateUSD || 0,
    ]);

    console.log("✅ Pricing inserted for customer:", custId);

    res.status(201).json({
      message: "Client information and contact info saved successfully",
      custId,
    });
  } catch (error) {
    console.error("❌ Save Client Error:", error);
    res.status(500).json({ error: "Failed to save client information" });
  }
};
