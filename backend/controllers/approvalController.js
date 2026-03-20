const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { pool, poolConnect } = require("../config/db");

// ✅ Create Proposal
const createProposal = async (req, res) => {
  const { planName, region, clientInfo, salespersonId } = req.body;

  if (!planName) {
    return res.status(400).json({ message: "Plan Name is required" });
  }

  try {
    await poolConnect;

    // 1️⃣ Create customer
    const customerResult = await pool.request()
      .input("custName", clientInfo?.custName || "Unknown Client")
      .input("custRegion", region || "India")
      .query(`
        INSERT INTO zhrcustomer (custName, role, custRegion)
        OUTPUT INSERTED.custId
        VALUES (@custName,'customer',@custRegion)
      `);

    const newCustId = customerResult.recordset[0].custId;

    // 2️⃣ Generate PDF
    const fileName = `ZingHR_Proposal_${clientInfo?.custName || "Client"}_${Date.now()}.pdf`;
    const pdfPath = `/uploads/proposals/${fileName}`;
    const pdfDir = path.join(__dirname, "../uploads/proposals");
    fs.mkdirSync(pdfDir, { recursive: true });
    const pdfFilePath = path.join(pdfDir, fileName);

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

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // 3️⃣ Insert proposal
    const proposalResult = await pool.request()
      .input("CustId", newCustId)
      .input("planName", planName)
      .input("region", region || "India")
      .input("clientName", clientInfo?.custName || "")
      .input("companyName", clientInfo?.companyName || "")
      .input("industry", clientInfo?.industry || "")
      .input("whiteCollar", clientInfo?.whiteCollar || 0)
      .input("blueCollar", clientInfo?.blueCollar || 0)
      .input("contractWorkforce", clientInfo?.contract || 0)
      .input("totalEmployees",
        (clientInfo?.whiteCollar || 0) +
        (clientInfo?.blueCollar || 0) +
        (clientInfo?.contract || 0)
      )
      .input("pdfPath", pdfPath)
      .input("createdBy", salespersonId)
      .query(`
        INSERT INTO zhrproposal
        (CustId, planName, region, clientName, companyName, industry,
         whiteCollar, blueCollar, contractWorkforce, totalEmployees,
         propDate, propVersion, pdfPath, createdBy)
        OUTPUT INSERTED.PropId
        VALUES
        (@CustId,@planName,@region,@clientName,@companyName,@industry,
         @whiteCollar,@blueCollar,@contractWorkforce,@totalEmployees,
         GETDATE(),1.0,@pdfPath,@createdBy)
      `);

    const newPropId = proposalResult.recordset[0].PropId;

    res.status(201).json({
      message: "Proposal created successfully",
      proposalId: newPropId,
      customerId: newCustId,
      pdfPath
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating proposal", error: error.message });
  }
};

// ✅ Add Pending Approval
const addPendingApproval = async (req, res) => {
  const { proposalId, planName, customerId, totalMonthly, totalMonthlyUSD } = req.body;

  try {
    await poolConnect;

    const proposalResult = await pool.request()
      .input("proposalId", proposalId)
      .query(`
        SELECT pdfPath, region
        FROM zhrproposal
        WHERE PropId=@proposalId
      `);

    const proposalRows = proposalResult.recordset;
    if (!proposalRows.length)
      return res.status(404).json({ message: "Proposal not found" });

    const pdfUrl = proposalRows[0].pdfPath;
    let region = proposalRows[0].region || "India";

    // Determine region approver
    let approverRegion = "India";
    const regionLower = region.toLowerCase();
    if (regionLower.includes("middle")) approverRegion = "Middle East & Africa";
    else if (regionLower.includes("south")) approverRegion = "South East Asia";

    const regionResult = await pool.request()
      .input("region", approverRegion)
      .query(`
        SELECT TOP 1 custId,custName
        FROM zhrcustomer
        WHERE role='approver' AND custRegion=@region
      `);

    let approvers = [];
    if (regionResult.recordset.length) approvers.push(regionResult.recordset[0]);

    // ✅ Add Prasad if total monthly exceeds threshold
    const prasadThresholdINR = 500000;
    const prasadThresholdUSD = 5445.89;
    const prasadResult = await pool.request()
      .query(`
        SELECT custId, custName
        FROM zhrcustomer
        WHERE custName='Prasad'
      `);

    if (
      (totalMonthly && totalMonthly > prasadThresholdINR) ||
      (totalMonthlyUSD && totalMonthlyUSD > prasadThresholdUSD)
    ) {
      if (prasadResult.recordset.length) approvers.push(prasadResult.recordset[0]);
    }

    // Insert into pending_approvals for all approvers
    for (const a of approvers) {
      await pool.request()
        .input("proposalId", proposalId)
        .input("customerId", customerId)
        .input("approverId", a.custId)
        .input("pdfUrl", pdfUrl)
        .input("planName", planName)
        .query(`
          INSERT INTO pending_approvals
          (proposalId,customerId,approverId,pdfUrl,planName,status)
          VALUES
          (@proposalId,@customerId,@approverId,@pdfUrl,@planName,'pending')
        `);
    }

    res.json({
      message: "Proposal sent for approval",
      proposalId,
      customerId,
      pdfUrl,
      approvers: approvers.map(a => a.custName)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding approval", error });
  }
};

// ✅ Approval Status
const getApprovalStatus = async (req, res) => {
  const { proposalId } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input("proposalId", proposalId)
      .query(`
        SELECT TOP 1 status
        FROM pending_approvals
        WHERE proposalId=@proposalId
        ORDER BY createdAt DESC
      `);

    const rows = result.recordset;
    if (!rows.length) return res.json({ status: "not_submitted" });

    res.json({ status: rows[0].status });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching approval status" });
  }
};

// ✅ Approve Proposal
const approveProposal = async (req, res) => {
  const { proposalId } = req.params;

  try {
    await poolConnect;

    await pool.request()
      .input("proposalId", proposalId)
      .query(`
        UPDATE pending_approvals
        SET status='approved'
        WHERE proposalId=@proposalId
      `);

    res.json({ message: "Proposal approved successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve proposal" });
  }
};

// ✅ Reject Proposal
const rejectProposal = async (req, res) => {
  const { proposalId } = req.params;
  const { comment } = req.body;

  if (!comment)
    return res.status(400).json({ message: "Rejection comment required" });

  try {
    await poolConnect;

    await pool.request()
      .input("proposalId", proposalId)
      .input("remarks", comment)
      .query(`
        UPDATE pending_approvals
        SET status='rejected',remarks=@remarks
        WHERE proposalId=@proposalId
      `);

    res.json({ message: "Proposal rejected successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject proposal" });
  }
};

// ✅ Get proposals created by salesperson
const getProposalsByCustomer = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    await poolConnect;

    const result = await pool.request()
      .input("customerId", customerId)
      .query(`
        SELECT
          p.PropId AS proposalId,
          p.clientName,
          p.companyName,
          p.planName,
          p.region,
          pa.status,
          pa.remarks,
          p.pdfPath AS pdfUrl
        FROM zhrproposal p
        LEFT JOIN pending_approvals pa
        ON p.PropId = pa.proposalId
        WHERE p.createdBy=@customerId
        ORDER BY p.propDate DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch proposals" });
  }
};

// ✅ Get pending approvals by region
const getPendingApprovalsByRegion = async (req, res) => {
  const { region } = req.query;

  try {
    await poolConnect;

    const result = await pool.request()
      .input("region", region)
      .query(`
        SELECT
          pa.proposalId,
          pa.customerId,
          pa.approverId,
          pa.pdfUrl,
          pa.planName,
          pa.status,
          p.clientName,
          p.companyName,
          p.region
        FROM pending_approvals pa
        JOIN zhrproposal p ON pa.proposalId = p.PropId
        WHERE p.region = @region AND pa.status='pending'
        ORDER BY pa.createdAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching approvals" });
  }
};

// ✅ Get pending approvals by customer
const getPendingApprovalsByCustomer = async (req, res) => {
  const { custId } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input("custId", custId)
      .query(`
        SELECT
          pa.proposalId,
          pa.customerId,
          pa.approverId,
          pa.pdfUrl,
          pa.planName,
          pa.status,
          p.clientName,
          p.companyName,
          p.region
        FROM pending_approvals pa
        JOIN zhrproposal p ON pa.proposalId = p.PropId
        WHERE pa.approverId=@custId AND pa.status='pending'
        ORDER BY pa.createdAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching approvals" });
  }
};

module.exports = {
  createProposal,
  addPendingApproval,
  getApprovalStatus,
  getPendingApprovalsByRegion,
  getPendingApprovalsByCustomer,
  approveProposal,
  rejectProposal,
  getProposalsByCustomer
};