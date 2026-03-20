// controllers/reportController.js
const { pool, poolConnect } = require("../config/db");

const getAllProposals = async (req, res) => {
  try {
    await poolConnect; // ensure DB connection is ready

    const result = await pool.request().query(`
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

    const rows = result.recordset;

    res.json(rows);

  } catch (err) {
    console.error("❌ Error fetching all proposals:", err);
    res.status(500).json({ message: "Error fetching proposals", error: err });
  }
};

module.exports = { getAllProposals };