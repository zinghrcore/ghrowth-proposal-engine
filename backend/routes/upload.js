const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, poolConnect } = require("../config/db"); // ✅ Updated for MSSQL

// Storage settings for uploaded PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/proposals");
    fs.mkdirSync(uploadDir, { recursive: true }); // ensure folder exists
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// POST endpoint for PDF upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    await poolConnect; // ✅ ensure MSSQL connection

    const { proposalId } = req.body; // get the proposal ID sent from frontend
    const filePath = `/uploads/proposals/${req.file.filename}`;

    // ✅ If proposalId exists, update its pdfPath in zhrproposal table
    if (proposalId) {
      await pool.request()
        .input("pdfPath", filePath)
        .input("proposalId", proposalId)
        .query(`
          UPDATE zhrproposal 
          SET pdfPath = @pdfPath 
          WHERE PropId = @proposalId
        `);

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