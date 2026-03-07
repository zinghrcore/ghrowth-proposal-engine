const express = require("express");
const router = express.Router();
const { getRegions, updateRegions, deleteRegion } = require("../controllers/regionController");

// GET all regions
router.get("/", getRegions);

// PUT update regions
router.put("/", updateRegions);

// DELETE region by id
router.delete("/:id", deleteRegion);

module.exports = router;
