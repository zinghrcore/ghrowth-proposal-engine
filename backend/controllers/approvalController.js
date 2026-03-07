const path = require('path');       // ✅ for file path operations
const fs = require('fs');           // ✅ for file system operations
const PDFDocument = require('pdfkit');
const db = require("../config/db");
// ✅ Create a new proposal and link it to the logged-in user (createdBy)
const createProposal = async (req, res) => {
  const { planName, region, clientInfo, salespersonId } = req.body; // salespersonId = logged-in user's CustId
  console.log("📨 Received salespersonId from frontend:", salespersonId);

  if (!planName) {
    return res.status(400).json({ message: "Plan Name is required" });
  }

  try {
    // 1️⃣ Create new customer
    const [customerResult] = await db.query(
      `INSERT INTO zhrcustomer (custName, role, custRegion)
       VALUES (?, 'customer', ?)`,
      [clientInfo?.custName || "Unknown Client", region || "India"]
    );

    const newCustId = customerResult.insertId;
    console.log("✅ New Customer created with ID:", newCustId);

    // ✅ 2️⃣ Generate pdfPath before inserting proposal
    const fileName = `ZingHR_Proposal_${clientInfo?.custName || "Client"}_${Date.now()}.pdf`;
    const pdfPath = `/uploads/proposals/${fileName}`;
    // Ensure folder exists
const pdfDir = path.join(__dirname, "../uploads/proposals");
fs.mkdirSync(pdfDir, { recursive: true }); 

// Full path to file
const pdfFilePath = path.join(pdfDir, fileName);

// Create PDF
const doc = new PDFDocument();
const writeStream = fs.createWriteStream(pdfFilePath);

doc.pipe(writeStream);

doc.fontSize(20).text('Proposal PDF', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text(`Client Name: ${clientInfo?.custName}`);
doc.text(`Company: ${clientInfo?.companyName}`);
doc.text(`Plan: ${planName}`);
doc.text(`Region: ${region}`);
doc.text(`Date: ${new Date().toLocaleDateString()}`);
doc.end();

// Wait for PDF to finish writing
await new Promise((resolve, reject) => {
  writeStream.on('finish', resolve);
  writeStream.on('error', reject);
});


    // 3️⃣ Insert proposal linked to that new customer + salesperson
    const [result] = await db.query(
      `INSERT INTO zhrproposal 
       (CustId, planName, region, clientName, companyName, industry, whiteCollar, blueCollar, contractWorkforce, totalEmployees, propDate, propVersion, pdfPath, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1.0, ?, ?)`,
      [
        newCustId,
        planName,
        region || "India",
        clientInfo?.custName || "",
        clientInfo?.companyName || "",
        clientInfo?.industry || "",
        clientInfo?.whiteCollar || 0,
        clientInfo?.blueCollar || 0,
        clientInfo?.contract || 0,
        (clientInfo?.whiteCollar || 0) +
          (clientInfo?.blueCollar || 0) +
          (clientInfo?.contract || 0),
        pdfPath,         // ✅ added this line (replaces "")
        salespersonId,   // ✅ logged-in user's CustId
      ]
    );

    const newPropId = result.insertId;
    console.log("✅ Proposal created successfully with ID:", newPropId);

    res.status(201).json({
      message: "Proposal created successfully",
      proposalId: newPropId,
      customerId: newCustId,
      pdfPath, // ✅ also send it back
    });
  } catch (error) {
    console.error("❌ Error creating proposal:", error.sqlMessage || error.message);
    res.status(500).json({
      message: "Error creating proposal",
      error: error.sqlMessage || error.message,
    });
  }
};


// ✅ Add a pending approval (Global + Region for high-value proposals)
const addPendingApproval = async (req, res) => {
  const { proposalId, planName, customerId } = req.body;

  if (!proposalId || !planName || !customerId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1️⃣ Get pdfPath & region from proposal
    const [proposalRows] = await db.query(
      "SELECT pdfPath, region FROM zhrproposal WHERE PropId = ?",
      [proposalId]
    );

    if (!proposalRows.length) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const pdfUrl = proposalRows[0].pdfPath;
    let region = proposalRows[0].region || "India";

    // 🧠 Normalize region
    let approverRegion = "India";
    const regionLower = region.toLowerCase();
    if (regionLower.includes("middle")) approverRegion = "Middle East & Africa";
    else if (regionLower.includes("south")) approverRegion = "South East Asia";
    else approverRegion = "India";

    console.log(`🌍 Proposal Region: ${region} → Mapped to Approver Region: ${approverRegion}`);

    // 2️⃣ Extract totals & currency from frontend
    const currency = (req.body.currency || "INR").toUpperCase();
    const totalINR = Number(String(req.body.totalMonthly || "0").replace(/[^0-9.]/g, ""));
    const totalUSD = Number(String(req.body.totalMonthlyUSD || "0").replace(/[^0-9.]/g, ""));
    const INR_THRESHOLD = 500000;
    const USD_THRESHOLD = 5511.05;

    let approvers = [];

    // 3️⃣ Always add the regional approver first
    const [regionRows] = await db.query(
      "SELECT custId, custName FROM zhrcustomer WHERE role = 'approver' AND custRegion = ? LIMIT 1",
      [approverRegion]
    );
    if (regionRows.length) {
      approvers.push({
        custId: regionRows[0].custId,
        custName: regionRows[0].custName,
        type: "Regional",
      });
    }

    // 4️⃣ If high-value → also add Prasad (Global)
    if (
      (currency === "INR" && totalINR >= INR_THRESHOLD) ||
      (currency === "USD" && totalUSD >= USD_THRESHOLD)
    ) {
      const [globalRows] = await db.query(
        "SELECT custId, custName FROM zhrcustomer WHERE role = 'approver' AND custRegion = 'Global' LIMIT 1"
      );
      if (globalRows.length) {
        approvers.push({
          custId: globalRows[0].custId,
          custName: globalRows[0].custName,
          type: "Global",
        });
      }
    }

    // 5️⃣ Insert one record per approver
    for (const a of approvers) {
      await db.query(
        "INSERT INTO pending_approvals (proposalId, customerId, approverId, pdfUrl, planName, status) VALUES (?, ?, ?, ?, ?, 'pending')",
        [proposalId, customerId, a.custId, pdfUrl, planName]
      );
      console.log(`✅ Sent for approval to ${a.type} Approver: ${a.custName} (ID: ${a.custId})`);
    }

    if (approvers.length === 0) {
      return res.status(404).json({ message: "No approver found for this region or global." });
    }

    res.json({
      message: `✅ Proposal sent to ${approvers.length} approver(s): ${approvers.map(a => a.custName).join(", ")}`,
      approvers,
      proposalId,
      customerId,
      pdfUrl,
    });
  } catch (error) {
    console.error("❌ Error adding pending approval:", error);
    res.status(500).json({ message: "Error adding pending approval", error });
  }
};

// ✅ Get current approval status
const getApprovalStatus = async (req, res) => {
  const { proposalId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT status FROM pending_approvals WHERE proposalId = ? ORDER BY createdAt DESC LIMIT 1",
      [proposalId]
    );

    if (rows.length === 0) return res.json({ status: "not_submitted" });

    res.json({ status: rows[0].status });
  } catch (error) {
    console.error("❌ Error fetching approval status:", error);
    res.status(500).json({ message: "Error fetching approval status" });
  }
};

// ✅ Get pending approvals for an approver in a specific region
const getPendingApprovalsByRegion = async (req, res) => {
  const { approverId, region } = req.query;

  if (!approverId || !region) {
    return res.status(400).json({ message: "Approver ID and region are required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT pa.*, c.custName, c.custRegion, p.pdfPath
       FROM pending_approvals pa
       JOIN zhrcustomer c ON pa.customerId = c.custId
       JOIN zhrproposal p ON pa.proposalId = p.PropId
       WHERE pa.approverId = ? AND c.custRegion = ? AND pa.status = 'pending'`,
      [approverId, region]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching pending approvals by region:", error);
    res.status(500).json({ message: "Error fetching pending approvals" });
  }
};

// ✅ Get all pending approvals for a specific approver
const getPendingApprovalsByCustomer = async (req, res) => {
  const approverId = req.params.custId; // same route param used in frontend

  try {
       const [rows] = await db.query(
      `SELECT 
         pa.proposalId,
         pa.customerId,
         pa.approverId,
         pa.pdfUrl,
         pa.planName,
         pa.status,
         p.clientName,
         p.companyName,
         p.pdfPath,
         p.region AS proposalRegion    -- ✅ added this
       FROM pending_approvals pa
       JOIN zhrproposal p ON pa.proposalId = p.PropId
       WHERE pa.approverId = ? AND pa.status = 'pending'`,
      [approverId]
    );
    // ✅ always send only the rows array
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching pending approvals:", err);
    res.status(500).json({ 
      error: "Failed to fetch pending approvals", 
      message: err.message 
    });
  }
};

// Approve proposal
const approveProposal = async (req, res) => {
  const { proposalId } = req.params;
  try {
    await db.query(
      "UPDATE pending_approvals SET status = 'approved' WHERE proposalId = ?",
      [proposalId]
    );
    res.json({ message: "Proposal approved successfully" });
  } catch (err) {
    console.error("❌ Error approving proposal:", err);
    res.status(500).json({ message: "Failed to approve proposal", error: err.message });
  }
};

// Reject proposal with comment
const rejectProposal = async (req, res) => {
  const { proposalId } = req.params;        // Proposal ID from URL
  const { comment } = req.body;             // Rejection comment sent from frontend

  // ✅ Validate comment
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Rejection comment is required" });
  }

  try {
    // ✅ Update pending_approvals table: set status and store remark
    await db.query(
      `UPDATE pending_approvals 
       SET status = 'rejected', remarks = ? 
       WHERE proposalId = ?`,
      [comment.trim(), proposalId]
    );

    // ✅ Respond success
    res.json({ message: "Proposal rejected successfully with remarks." });
  } catch (err) {
    console.error("❌ Error rejecting proposal:", err);
    res.status(500).json({ message: "Failed to reject proposal", error: err.message });
  }
};

// Get all proposals sent by a specific customer (salesperson)
const getProposalsByCustomer = async (req, res) => {
  const customerId = req.params.customerId;

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    const [rows] = await db.query(
  `SELECT 
     p.PropId AS proposalId,
     p.clientName,
     p.companyName,
     p.planName,
     p.region,
     pa.status,
     pa.remarks,       -- add this line
     p.pdfPath AS pdfUrl
   FROM zhrproposal p
   LEFT JOIN pending_approvals pa ON p.PropId = pa.proposalId
   WHERE p.createdBy = ? 
   ORDER BY p.propDate DESC`,
  [customerId]
);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching proposals by customer:", err);
    res.status(500).json({ message: "Failed to fetch proposals", error: err.message });
  }
};

module.exports = {
  createProposal, 
  addPendingApproval,
  getApprovalStatus,
  getPendingApprovalsByRegion,
  getPendingApprovalsByCustomer,
  approveProposal,   // <-- add
  rejectProposal,    // <-- add
  getProposalsByCustomer,
};



