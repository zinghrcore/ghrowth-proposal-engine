const db = require('../config/db'); // ✅ updated path

// Create new proposal
const createProposal = (req, res) => {
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
  } = req.body;

  const sql = `
    INSERT INTO zhrproposal (
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
      migrationFeeApplicable
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
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
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error creating proposal:', err);
        return res.status(500).json({ message: 'Failed to create proposal' });
      }
      console.log('✅ Proposal created successfully:', result.insertId);
      res.status(200).json({
        message: 'Proposal created successfully',
        proposalId: result.insertId,
      });
    }
  );
};

module.exports = { createProposal };
