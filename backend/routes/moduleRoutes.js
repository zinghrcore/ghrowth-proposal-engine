const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// ✅ Get module counts summary (must come BEFORE /:id)
router.get('/summary', moduleController.getModuleCounts);

// ✅ Get feature comparison (before /:id as well)
router.get('/feature-comparison', moduleController.getFeatureComparison);

// ✅ Get all modules
router.get('/', moduleController.getAllModules);

// ✅ Get single module by ID
router.get('/:id', moduleController.getModuleById);

// ✅ Create a new module
router.post('/', moduleController.createModule);

// ✅ Bulk update modules
router.put('/bulk', moduleController.updateModulesBulk);

// ✅ Delete module
router.delete('/:id', moduleController.deleteModule);
router.put("/update-status", moduleController.updateModulePackageStatus);


module.exports = router;
