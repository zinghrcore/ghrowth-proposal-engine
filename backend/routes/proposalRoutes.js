const express = require('express');
const { createProposal } = require('../controllers/proposalController');

const router = express.Router();

// POST: Create new proposal
router.post('/', createProposal);

module.exports = router;
