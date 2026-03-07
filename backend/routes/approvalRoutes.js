const express = require("express");
const router = express.Router();
const {
  createProposal, 
  addPendingApproval,
  getApprovalStatus,
  getPendingApprovalsByRegion,
  getPendingApprovalsByCustomer,
  approveProposal, // ✅ import
  rejectProposal,   // ✅ import
  getProposalsByCustomer
} = require("../controllers/approvalController");
router.post("/create-proposal", createProposal);
// Existing routes
router.post("/pending-approvals", addPendingApproval);
router.get("/status/:proposalId", getApprovalStatus);
router.get("/region", getPendingApprovalsByRegion);
router.get("/pending-approvals/:custId", getPendingApprovalsByCustomer);

// ✅ Add approve/reject routes
router.put("/approve/:proposalId", approveProposal);
router.put("/reject/:proposalId", rejectProposal);
// approvalController.js
router.get("/my-proposals/:customerId", getProposalsByCustomer);
module.exports = router;
