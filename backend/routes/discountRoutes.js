const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");

// Get all discounts
router.get("/", discountController.getAllDiscounts);

// Get discount by code
router.get("/:code", discountController.getDiscountByCode);

// Add a new discount
router.post("/", discountController.createDiscount);

// Update a discount
router.put("/:id", discountController.updateDiscount);

// Delete a discount
router.delete("/:id", discountController.deleteDiscount);
// Get all unique discount types
router.get("/types/all", discountController.getDiscountTypes);
router.put("/", discountController.updateDiscountsBulk);



module.exports = router;
