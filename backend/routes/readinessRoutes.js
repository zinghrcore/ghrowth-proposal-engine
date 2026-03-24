const express = require("express");
const router = express.Router();
const readinessController = require("../controllers/readinessController");

router.get("/sections", readinessController.getSections);
router.get("/items", readinessController.getItems);

module.exports = router;