const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require("../config/db"); // ✅ Add this


// Storage settings for uploaded PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/proposals'); // folder to save PDFs
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// POST endpoint for PDF upload
// ✅ Updated PDF upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { proposalId } = req.body; // get the proposal ID sent from frontend
    const filePath = `/uploads/proposals/${req.file.filename}`;

    // ✅ If proposalId exists, update its pdfPath in zhrproposal table
    if (proposalId) {
      await db.query("UPDATE zhrproposal SET pdfPath = ? WHERE PropId = ?", [
        filePath,
        proposalId,
      ]);
      console.log(`✅ Updated proposal ${proposalId} with new PDF path.`);
    }

    res.json({
      message: "File uploaded and linked successfully!",
      filePath,
    });
  } catch (err) {
    console.error("❌ Error during file upload:", err);
    res.status(500).json({
      message: "File upload failed",
      error: err.message,
    });
  }
});

module.exports = router;
