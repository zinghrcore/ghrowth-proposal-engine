const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// ✅ Specific routes should come first
router.get('/summary', moduleController.getModuleCounts);
router.get('/feature-comparison', moduleController.getFeatureComparison);
router.put('/bulk', moduleController.updateModulesBulk);
router.put('/update-status', moduleController.updateModulePackageStatus);

// ✅ General routes
router.get('/', moduleController.getAllModules);
router.post('/', moduleController.createModule);

// ✅ Dynamic ID routes should always come last
router.get('/:id', moduleController.getModuleById);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;