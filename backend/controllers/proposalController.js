// controllers/proposalController.js
const { pool, poolConnect } = require("../config/db"); // MSSQL
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// --- Utility functions for approver logic ---

// 1️⃣ Determine region approver based on region name
async function getRegionApprover(region) {
  await poolConnect;

  const regionLower = (region || "").toLowerCase();
  let regionKey = "India";
  if (regionLower.includes("middle")) regionKey = "Middle East & Africa";
  else if (regionLower.includes("south")) regionKey = "South East Asia";

  const result = await pool.request()
    .input("regionKey", regionKey)
    .query(`
      SELECT TOP 1 custId, custName 
      FROM zhrcustomer 
      WHERE role = 'approver' AND custRegion = @regionKey
    `);

  return result.recordset.length ? result.recordset[0] : null;
}

// 2️⃣ Get global approver (Prasad)
async function getGlobalApprover() {
  await poolConnect;

  const result = await pool.request()
    .query(`
      SELECT TOP 1 custId, custName 
      FROM zhrcustomer 
      WHERE role = 'approver' AND custRegion = 'Global'
    `);

  return result.recordset.length ? result.recordset[0] : null;
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/proposals");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const proposalId = req.body.proposalId || "unknown";
    cb(null, `Proposal_${proposalId}.pdf`);
  },
});

const upload = multer({ storage });

// Controller: Upload PDF
const uploadProposalPDF = async (req, res) => {
  try {
    await poolConnect;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const proposalId = req.body.proposalId;
    const pdfPath = `/uploads/proposals/${req.file.filename}`;

    await pool.request()
      .input("pdfPath", pdfPath)
      .input("proposalId", proposalId)
      .query(`UPDATE zhrproposal SET pdfPath = @pdfPath WHERE PropId = @proposalId`);

    res.json({ message: "PDF uploaded successfully", path: pdfPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading PDF", error });
  }
};

// Controller: Create Proposal
const createProposal = async (req, res) => {
  try {
    await poolConnect;

    const {
      CustId,
      propDate,
      propVersion,
      custSignName,
      custSignDesig,
      custSignDate,
      modulesOpted,
      billingFreq,
      mrrApplicable,
      inflationRate,
      inflationApplicable,
      ImplFeeApplicable,
      migrationFeeApplicable,
      clientName,
      companyName,
      industry,
      whiteCollar,
      blueCollar,
      contractWorkforce,
      totalEmployees,
    } = req.body;

    console.log("📥 Incoming Proposal Data:", req.body);

    const modulesOptedStr =
      typeof modulesOpted === "string" ? modulesOpted : JSON.stringify(modulesOpted || []);

    // --- Insert proposal into DB ---
    const result = await pool.request()
      .input("CustId", CustId || null)
      .input("propDate", propDate || null)
      .input("propVersion", propVersion || null)
      .input("custSignName", custSignName || null)
      .input("custSignDesig", custSignDesig || null)
      .input("custSignDate", custSignDate || null)
      .input("modulesOpted", modulesOptedStr)
      .input("billingFreq", billingFreq || null)
      .input("mrrApplicable", mrrApplicable || 0)
      .input("inflationRate", inflationRate || 0)
      .input("inflationApplicable", inflationApplicable || 0)
      .input("ImplFeeApplicable", ImplFeeApplicable || 0)
      .input("migrationFeeApplicable", migrationFeeApplicable || 0)
      .input("clientName", clientName || null)
      .input("companyName", companyName || null)
      .input("industry", industry || null)
      .input("whiteCollar", whiteCollar || 0)
      .input("blueCollar", blueCollar || 0)
      .input("contractWorkforce", contractWorkforce || 0)
      .input("totalEmployees", totalEmployees || 0)
      .query(`
        INSERT INTO zhrproposal (
          CustId, propDate, propVersion, custSignName, custSignDesig, custSignDate,
          modulesOpted, billingFreq, mrrApplicable, inflationRate, inflationApplicable,
          ImplFeeApplicable, migrationFeeApplicable, clientName, companyName, industry,
          whiteCollar, blueCollar, contractWorkforce, totalEmployees
        )
        OUTPUT INSERTED.PropId
        VALUES (
          @CustId,@propDate,@propVersion,@custSignName,@custSignDesig,@custSignDate,
          @modulesOpted,@billingFreq,@mrrApplicable,@inflationRate,@inflationApplicable,
          @ImplFeeApplicable,@migrationFeeApplicable,@clientName,@companyName,@industry,
          @whiteCollar,@blueCollar,@contractWorkforce,@totalEmployees
        )
      `);

    const proposalId = result.recordset[0].PropId;
    console.log("✅ Proposal created. PropId:", proposalId);

    // --- Approver Assignment ---
 // --- Approver Assignment ---
let approversToAdd = [];

const regionRaw = req.body.custRegion || req.body.region || "India";
const region = (regionRaw || "India").toLowerCase().trim();
const currency = (req.body.currency || "INR").toUpperCase();

const totalMonthlyINR = Number(String(req.body.totalMonthly || "0").replace(/[^0-9.]/g, ""));
const totalMonthlyUSD = Number(String(req.body.totalMonthlyUSD || "0").replace(/[^0-9.]/g, ""));

const INR_THRESHOLD = 500000;
const USD_THRESHOLD = 5511.05;

// 1️⃣ Regional approver
if (region.includes("india")) approversToAdd.push(5);       // Rohan Menon
else if (region.includes("middle") || region.includes("africa")) approversToAdd.push(3); // Chandru S
else if (region.includes("south")) approversToAdd.push(4);  // Rajat Luthra

// 2️⃣ High-value proposals → always include Prasad
if ((currency === "INR" && totalMonthlyINR > INR_THRESHOLD) ||
    (currency === "USD" && totalMonthlyUSD > USD_THRESHOLD)) {
  if (!approversToAdd.includes(2)) approversToAdd.push(2); // Prasad
}

// 3️⃣ Insert all approvers into pending_approvals
for (const approverId of approversToAdd) {
  await pool.request()
    .input("proposalId", proposalId)
    .input("customerId", CustId)
    .input("approverId", approverId)
    .input("planName", req.body.planName || "N/A")
    .query(`
      INSERT INTO pending_approvals 
        (proposalId, customerId, approverId, planName, pdfUrl, status)
      VALUES 
        (@proposalId, @customerId, @approverId, @planName, NULL, 'pending')
    `);
}

console.log("✅ Assigned approvers:", approversToAdd);
    // --- PDF Generation ---
    const pdfFileName = `Proposal_${proposalId}.pdf`;
    const pdfDir = path.join(__dirname, "../uploads/proposals");
    const pdfFilePath = path.join(pdfDir, pdfFileName);
    fs.mkdirSync(pdfDir, { recursive: true });

    const generatePDF = () =>
      new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfFilePath);
        doc.pipe(writeStream);

        doc.fontSize(20).text("Proposal PDF", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Client Name: ${clientName}`);
        doc.text(`Company: ${companyName}`);
        doc.text(`Date: ${propDate}`);
        doc.text(`Modules Opted: ${modulesOptedStr}`);
        doc.text(`Billing Frequency: ${billingFreq}`);
        doc.text(`Total Employees: ${totalEmployees}`);
        doc.end();

        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

    await generatePDF();

    const pdfUrl = `/uploads/proposals/${pdfFileName}`;
    await pool.request()
      .input("pdfUrl", pdfUrl)
      .input("proposalId", proposalId)
      .query(`UPDATE zhrproposal SET pdfPath=@pdfUrl WHERE PropId=@proposalId`);

    res.status(200).json({
      message: "Proposal created successfully and sent for approval",
      proposalId,
      approverId,
      pdfUrl,
    });

  } catch (error) {
    console.error("❌ Error creating proposal:", error);
    res.status(500).json({ message: "Failed to create proposal", error });
  }
};

// Get proposals by customer
const getProposalsByCustomer = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input("custId", req.params.custId)
      .query(`
        SELECT 
  p.PropId AS proposalId,
  p.clientName,
  p.companyName,
  p.propDate AS propDate,
  p.planName,
  p.region,
  p.pdfPath AS pdfUrl,
  pa.status AS approvalStatus
FROM zhrproposal p
LEFT JOIN (
    SELECT proposalId, MAX(status) AS status
    FROM pending_approvals
    GROUP BY proposalId
) pa ON p.PropId = pa.proposalId
WHERE p.CustId = @custId
      `);

    const proposals = result.recordset.map((p) => ({
      ...p,
      approved: p.approvalStatus === 'approved',
      status: p.approvalStatus || 'pending',
    }));

    res.json(proposals);
  } catch (err) {
    console.error("❌ Error fetching proposals:", err);
    res.status(500).json({ message: "Error fetching proposals" });
  }
};

// Get proposal by ID
const getProposalById = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input("proposalId", req.params.proposalId)
      .query(`SELECT * FROM zhrproposal WHERE PropId = @proposalId`);

    if (!result.recordset.length) return res.status(404).json({ message: "Proposal not found" });

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("❌ Error fetching proposal:", error);
    res.status(500).json({ message: "Failed to fetch proposal details" });
  }
};

// Get all proposals (admin)
const getAllProposals = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT 
        p.PropId AS proposalId,
        p.clientName,
        p.companyName,
        p.planName,
        p.region,
        pa.status AS approvalStatus,
        p.pdfPath AS pdfUrl,
        p.createdBy
      FROM zhrproposal p
      LEFT JOIN pending_approvals pa ON p.PropId = pa.proposalId
      ORDER BY p.propDate DESC
    `);

    const proposals = result.recordset.map((p) => ({
      ...p,
      status: p.approvalStatus || "not submitted",
    }));

    res.json(proposals);
  } catch (err) {
    console.error("❌ Error fetching all proposals:", err);
    res.status(500).json({ message: "Failed to fetch all proposals", error: err.message });
  }
};

module.exports = {
  createProposal,
  uploadProposalPDF,
  upload,
  getProposalsByCustomer,
  getProposalById,
  getAllProposals
};