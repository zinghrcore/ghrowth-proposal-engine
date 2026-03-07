const express = require("express");
const router = express.Router();
const { getAllProposals } = require("../controllers/reportController");

// ✅ Admin reports: fetch all proposals
router.get("/all-proposals", getAllProposals);

module.exports = router;
