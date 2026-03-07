const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// Get all packages
router.get('/', packageController.getPackages);

// Update packages (admin only)
router.put('/', packageController.updatePackages);


module.exports = router;
