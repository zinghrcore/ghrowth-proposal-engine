// controllers/reportController.js
const db = require("../config/db");

const getAllProposals = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        zhrproposal.PropId,
        zhrproposal.clientName,
        zhrproposal.companyName,
        zhrproposal.propDate,
        zhrproposal.pdfPath,
        pa.status AS status
      FROM zhrproposal
      LEFT JOIN pending_approvals pa
        ON pa.proposalId = zhrproposal.PropId
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching all proposals:", err);
    res.status(500).json({ message: "Error fetching proposals", error: err });
  }
};

module.exports = { getAllProposals };
