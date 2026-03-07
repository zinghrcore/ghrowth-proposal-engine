const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
// --- Utility functions for approver logic ---

// 1️⃣ Determine region approver based on region name
async function getRegionApprover(region) {
  const regionLower = (region || "").toLowerCase();

  let regionKey = "India";
  if (regionLower.includes("middle")) regionKey = "Middle East & Africa";
  else if (regionLower.includes("south")) regionKey = "South East Asia";

  const [rows] = await db.query(
    "SELECT custId, custName FROM zhrcustomer WHERE role = 'approver' AND custRegion = ? LIMIT 1",
    [regionKey]
  );

  return rows.length ? rows[0] : null;
}

// 2️⃣ Get global approver (Prasad)
async function getGlobalApprover() {
  const [rows] = await db.query(
    "SELECT custId, custName FROM zhrcustomer WHERE role = 'approver' AND custRegion = 'Global' LIMIT 1"
  );
  return rows.length ? rows[0] : null;
}


// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/proposals"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const proposalId = req.body.proposalId || "unknown";
    cb(null, `Proposal_${proposalId}.pdf`);
  },
});

const upload = multer({ storage });

// Controller function: Upload PDF
const uploadProposalPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const proposalId = req.body.proposalId;
    const pdfPath = `/uploads/proposals/${req.file.filename}`;

    await db.query("UPDATE zhrproposal SET pdfPath = ? WHERE PropId = ?", [pdfPath, proposalId]);

    res.json({ message: "PDF uploaded successfully", path: pdfPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading PDF", error });
  }
};

// Controller function: Create new proposal with PDF
const createProposal = async (req, res) => {
  try {
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

    // Safely stringify modulesOpted
    const modulesOptedStr =
      typeof modulesOpted === "string" ? modulesOpted : JSON.stringify(modulesOpted || []);

    // --- Insert proposal into DB ---
    const sql = `
      INSERT INTO zhrproposal (
        CustId, propDate, propVersion, custSignName, custSignDesig, custSignDate,
        modulesOpted, billingFreq, mrrApplicable, inflationRate, inflationApplicable,
        ImplFeeApplicable, migrationFeeApplicable, clientName, companyName, industry,
        whiteCollar, blueCollar, contractWorkforce, totalEmployees
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      CustId || null,
      propDate || null,
      propVersion || null,
      custSignName || null,
      custSignDesig || null,
      custSignDate || null,
      modulesOptedStr,
      billingFreq || null,
      mrrApplicable || 0,
      inflationRate || 0,
      inflationApplicable || 0,
      ImplFeeApplicable || 0,
      migrationFeeApplicable || 0,
      clientName || null,
      companyName || null,
      industry || null,
      whiteCollar || 0,
      blueCollar || 0,
      contractWorkforce || 0,
      totalEmployees || 0,
    ];

    const [result] = await db.query(sql, values);
    const proposalId = result.insertId;
    console.log("✅ Proposal created. PropId:", proposalId);
// --- Approver Assignment ---
let totalMonthlyINR = 0;
let totalMonthlyUSD = 0;

// Safely convert totals (remove commas, ₹, $)
try {
  totalMonthlyINR = Number(String(req.body.totalMonthly || "0").replace(/[^0-9.]/g, ""));
  totalMonthlyUSD = Number(String(req.body.totalMonthlyUSD || "0").replace(/[^0-9.]/g, ""));
} catch (err) {
  console.log("⚠️ Error converting totals:", err);
}

// ✅ Use region from either custRegion or region field sent by frontend
const regionRaw = req.body.custRegion || req.body.region || "India";
const region = regionRaw.toLowerCase().trim();
const currency = (req.body.currency || "INR").toUpperCase();

console.log("🌍 Region:", regionRaw, "Currency:", currency, "INR:", totalMonthlyINR, "USD:", totalMonthlyUSD);

const INR_THRESHOLD = 500000;
const USD_THRESHOLD = 5511.66;

let approverId = null;

// --- High-value first ---
if ((currency === "INR" && totalMonthlyINR > INR_THRESHOLD) ||
    (currency === "USD" && totalMonthlyUSD > USD_THRESHOLD)) {
  approverId = 2; // Prasad
  console.log("💰 High-value proposal → Prasad (custId: 2)");
}
// --- Normal India ---
else if (region.includes("india")) {
  approverId = 355; // Rohan Menon
  console.log("🇮🇳 Normal India → Rohan Menon (custId: 355)");
}
// --- Normal Middle East & Africa ---
else if (region.includes("middle") || region.includes("africa")) {
  approverId = 3; // Chandru S
  console.log("🌍 MEA → Chandru S (custId: 3)");
}
// --- Normal South East Asia ---
else if (region.includes("south")) {
  approverId = 4; // Rajat Luthra
  console.log("🌏 SEA → Rajat Luthra (custId: 4)");
}

if (approverId) {
  await db.query(
    "INSERT INTO pending_approvals (proposalId, customerId, approverId, planName, pdfUrl, status) VALUES (?, ?, ?, ?, ?, 'pending')",
    [proposalId, CustId, approverId, req.body.planName || "N/A", null]
  );
  console.log(`✅ Added pending approval for approverId ${approverId}`);
} else {
  console.log("⚠️ No approver matched for region:", regionRaw);
}


    // --- PDF Generation ---
    const pdfFileName = `Proposal_${proposalId}.pdf`;
    const pdfDir = path.join(__dirname, "../uploads/proposals");
    const pdfFilePath = path.join(pdfDir, pdfFileName);

    // Ensure directory exists
    fs.mkdirSync(pdfDir, { recursive: true });

    // Wrap PDF writing in a promise so we can await it
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

        writeStream.on("finish", () => resolve());
        writeStream.on("error", (err) => reject(err));
      });

    await generatePDF();
    console.log("📄 PDF generated successfully:", pdfFilePath);

    // Update DB with PDF path
    const pdfUrl = `/uploads/proposals/${pdfFileName}`;
    await db.query("UPDATE zhrproposal SET pdfPath = ? WHERE PropId = ?", [pdfUrl, proposalId]);

    console.log("✅ PDF path saved in DB:", pdfUrl);

    // Send response
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

// ✅ New controller: Get proposals by customer
  const getProposalsByCustomer = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         zhrproposal.PropId,
         zhrproposal.clientName,
         zhrproposal.companyName,
         zhrproposal.propDate,
         zhrproposal.pdfPath,
         zhrproposal.approverId,
         pa.status AS approvalStatus
       FROM zhrproposal
       LEFT JOIN pending_approvals pa
         ON pa.proposalId = zhrproposal.PropId
       WHERE zhrproposal.CustId = ?`,
      [req.params.custId]
    );

    // ✅ Use actual approval status from pending_approvals
    const proposals = rows.map((p) => ({
      ...p,
      approved: p.approvalStatus === 'approved', // true only if approved
      status: p.approvalStatus || 'pending',     // fallback to pending
    }));

    res.json(proposals);
  } catch (err) {
    console.error("❌ Error fetching proposals:", err);
    res.status(500).json({ message: "Error fetching proposals" });
  }
};
const getProposalById = async (req, res) => {
  const { proposalId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM zhrproposal WHERE PropId = ?`,
      [proposalId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.json(rows[0]); // return full proposal details
  } catch (error) {
    console.error("❌ Error fetching proposal:", error);
    res.status(500).json({ message: "Failed to fetch proposal details" });
  }
};

// Get all proposals (for admin)
const getAllProposals = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
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
       ORDER BY p.propDate DESC`
    );

    const proposals = rows.map((p) => ({
      ...p,
      status: p.approvalStatus || "not submitted",
    }));

    res.json(proposals);
  } catch (err) {
    console.error("❌ Error fetching all proposals:", err);
    res.status(500).json({ message: "Failed to fetch all proposals", error: err.message });
  }
};

  module.exports = { createProposal, uploadProposalPDF, upload, getProposalsByCustomer,getProposalById,getAllProposals };
