const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Test route (keep this for now)
router.get('/test', (req, res) => {
  res.json({ message: 'Customer route is working!' });
});

// Register new customer
router.post('/register', customerController.registerCustomer);
router.put("/region", customerController.updateRegion);
router.post("/saveClientInformation", customerController.saveClientInformation);

module.exports = router;
