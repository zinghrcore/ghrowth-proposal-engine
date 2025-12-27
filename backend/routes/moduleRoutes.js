const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

router.get('/', moduleController.getAllModules);          
router.get('/:id', moduleController.getModuleById);       
router.post('/', moduleController.createModule);          
router.put('/:id', moduleController.updateModule);        
router.put('/bulk', moduleController.updateModulesBulk);   // ✅ Corrected path
router.delete('/:id', moduleController.deleteModule);     

module.exports = router;
