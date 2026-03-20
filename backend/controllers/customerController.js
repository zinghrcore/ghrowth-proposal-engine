const { pool, poolConnect } = require('../config/db');
const bcrypt = require('bcryptjs');


// Register new customer
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
      custType,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "customer";

    if (custType && typeof custType === "string") {
      const type = custType.toLowerCase().trim();
      if (type === "approver") role = "approver";
      else if (type === "admin") role = "admin";
    }

    let regionToSave = custRegion;

    if (role === "approver") {
      const name = (custName || "").toLowerCase();

      if (name.includes("prasad")) regionToSave = "Global";
      else if (name.includes("chandru") || name.includes("chandra")) regionToSave = "Middle East & Africa";
      else if (name.includes("rajat")) regionToSave = "South East Asia";
      else if (name.includes("rohan")) regionToSave = "India";
      else regionToSave = "India";
    }

    await poolConnect;

    await pool.request()
      .input("custName", custName)
      .input("custCHRO", custCHRO)
      .input("custCHROEmail", custCHROEmail)
      .input("custCHROPhone", custCHROPhone)
      .input("custRegion", regionToSave)
      .input("custAddress", custAddress)
      .input("password", hashedPassword)
      .input("role", role)
      .query(`
        INSERT INTO zhrcustomer
        (custName,custCHRO,custCHROEmail,custCHROPhone,custRegion,custAddress,password,role)
        VALUES
        (@custName,@custCHRO,@custCHROEmail,@custCHROPhone,@custRegion,@custAddress,@password,@role)
      `);

    res.status(201).json({
      message: "Registration successful",
      role,
      region: regionToSave
    });

  } catch (error) {

    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed" });

  }
};



// Login
exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    await poolConnect;

    const result = await pool.request()
      .input("email", email)
      .query(`
        SELECT *
        FROM zhrcustomer
        WHERE custCHROEmail=@email
      `);

    const rows = result.recordset;

    if (!rows.length)
      return res.status(400).json({ message: "User not found" });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    let role = user.role ? user.role.toString().trim().toLowerCase() : "customer";

    if (!['admin','approver','customer'].includes(role))
      role = "customer";

    res.json({
      message: "Login successful",
      user: {
        id: user.custId,
        custName: user.custName,
        email: user.custCHROEmail,
        role,
        custType: user.custType,
        custRegion: user.custRegion
      }
    });

  } catch (err) {

    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });

  }

};



// Update region
exports.updateRegion = async (req, res) => {

  try {

    const { custId, region } = req.body;

    if (!custId || !region)
      return res.status(400).json({ error: "custId and region required" });

    await poolConnect;

    await pool.request()
      .input("region", region)
      .input("custId", custId)
      .query(`
        UPDATE zhrcustomer
        SET custRegion=@region
        WHERE custId=@custId
      `);

    res.json({ message: "Region updated successfully" });

  } catch (err) {

    console.error("Update Region Error:", err);
    res.status(500).json({ error: "Failed to update region" });

  }

};



// Save Client Information
exports.saveClientInformation = async (req, res) => {

  try {

    const {
      custName,
      industry,
      whiteCollar,
      blueCollar,
      contract,
      otherEmployees,
      selectedPlan,
      rateINR,
      rateUSD,
      implementationFee,
      custRegion,
      custAddress,
      clientName,
      clientEmail,
      clientMobile,
      zinghrName,
      zinghrEmail,
      zinghrMobile,
      custCHRO,
      custCHROPhone,
      custCHROEmail
    } = req.body;

    await poolConnect;

    // Insert customer
    const customerResult = await pool.request()
      .input("custName", custName)
      .input("custRegion", custRegion || "India")
      .input("custAddress", custAddress || "")
      .input("custCHRO", custCHRO || "")
      .input("custCHROPhone", custCHROPhone || "")
      .input("custCHROEmail", custCHROEmail || "")
      .input("whiteCollar", whiteCollar || 0)
      .input("blueCollar", blueCollar || 0)
      .input("contract", contract || 0)
      .input("otherEmployees", otherEmployees || 0)
      .query(`
        INSERT INTO zhrcustomer
        (custName,custRegion,custAddress,custCHRO,custCHROPhone,custCHROEmail,
        empCountWhite,empCountBlue,empContract,empOther,role)
        OUTPUT INSERTED.custId
        VALUES
        (@custName,@custRegion,@custAddress,@custCHRO,@custCHROPhone,@custCHROEmail,
        @whiteCollar,@blueCollar,@contract,@otherEmployees,'customer')
      `);

    const custId = customerResult.recordset[0].custId;


    // Client SPOC
    if (clientName && clientEmail) {

      await pool.request()
        .input("custId", custId)
        .input("spocName", clientName)
        .input("spocEmail", clientEmail)
        .input("spocPhone", clientMobile || "")
        .query(`
          INSERT INTO zhrcustomer_spoc
          (custId,spocName,spocEmail,spocPhone,type)
          VALUES
          (@custId,@spocName,@spocEmail,@spocPhone,'client')
        `);

    }


    // ZingHR SPOC
    if (zinghrName && zinghrEmail) {

      await pool.request()
        .input("custId", custId)
        .input("spocName", zinghrName)
        .input("spocEmail", zinghrEmail)
        .input("spocPhone", zinghrMobile || "")
        .query(`
          INSERT INTO zhrcustomer_spoc
          (custId,spocName,spocEmail,spocPhone,type)
          VALUES
          (@custId,@spocName,@spocEmail,@spocPhone,'zinghr')
        `);

    }


    let modId = 1;

    if (selectedPlan === "ZingHR Pro") modId = 1;
    else if (selectedPlan === "ZingHR Pro Plus") modId = 2;
    else if (selectedPlan === "ZingHR GHROWTH") modId = 3;


    await pool.request()
      .input("modId", modId)
      .input("custId", custId)
      .input("rateINR", rateINR || 0)
      .input("rateUSD", rateUSD || 0)
      .query(`
        INSERT INTO zhrmodcustpricing
        (modId,custTypeId,PriceINR,PriceUSD)
        VALUES
        (@modId,@custId,@rateINR,@rateUSD)
      `);


    res.status(201).json({
      message: "Client information saved successfully",
      custId
    });

  } catch (error) {

    console.error("Save Client Error:", error);
    res.status(500).json({ error: "Failed to save client information" });

  }

};