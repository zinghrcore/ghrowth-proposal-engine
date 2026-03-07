const express = require('express');
const { createProposal, uploadProposalPDF, upload, getProposalsByCustomer,getProposalById,getAllProposals } = require("../controllers/proposalController");

const router = express.Router();

// POST: Create new proposal
router.post('/', createProposal);

// GET: Proposals for a customer
router.get("/customer/:custId", getProposalsByCustomer);
router.get("/:proposalId", getProposalById);
router.put('/:proposalId/pdf', upload.single('file'), uploadProposalPDF);
router.get("/admin/all-proposals", getAllProposals);

module.exports = router;
