import db from "../config/db.js"; // your DB connection

// Get all discounts
export const getAllDiscounts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM zhrdiscount");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get discount by code
export const getDiscountByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM zhrdiscount WHERE discCode = ?",
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Invalid discount code" });
    }

    const discount = rows[0];
    const currentMonth = new Date().getMonth() + 1;

    if (currentMonth < discount.validFromMonth || currentMonth > discount.validToMonth) {
      return res.status(400).json({ message: "Discount code not valid this month" });
    }

    res.json(discount);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new discount
export const createDiscount = async (req, res) => {
  const { discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO zhrdiscount (discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth) VALUES (?, ?, ?, ?, ?, ?)",
      [discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth]
    );

    const [newDiscountRows] = await db.query(
      "SELECT * FROM zhrdiscount WHERE discId = ?",
      [result.insertId]
    );

    res.status(201).json(newDiscountRows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing discount
export const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const { discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth } = req.body;

  try {
    await db.query(
      "UPDATE zhrdiscount SET discCode = ?, discDesc = ?, discPercentage = ?, discType = ?, validFromMonth = ?, validToMonth = ? WHERE discId = ?",
      [discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth, id]
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM zhrdiscount WHERE discId = ?",
      [id]
    );

    res.json(updatedRows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a discount
export const deleteDiscount = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM zhrdiscount WHERE discId = ?", [id]);
    res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Bulk update discounts (for admin dashboard)
export const updateDiscountsBulk = async (req, res) => {
  try {
    const { discounts } = req.body;
    if (!Array.isArray(discounts)) {
      return res.status(400).json({ message: "Discounts array is required" });
    }

    const promises = discounts.map(async (disc) => {
      if (disc.discId) {
        // Update existing discount
        await db.query(
          "UPDATE zhrdiscount SET discCode=?, discDesc=?, discPercentage=?, discType=?, validFromMonth=?, validToMonth=? WHERE discId=?",
          [
            disc.discCode,
            disc.discDesc,
            disc.discPercentage,
            disc.discType,
            disc.validFromMonth,
            disc.validToMonth,
            disc.discId,
          ]
        );
      } else {
        // Insert new discount
        await db.query(
          "INSERT INTO zhrdiscount (discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth) VALUES (?, ?, ?, ?, ?, ?)",
          [
            disc.discCode,
            disc.discDesc,
            disc.discPercentage,
            disc.discType,
            disc.validFromMonth,
            disc.validToMonth,
          ]
        );
      }
    });

    await Promise.all(promises);
    res.json({ message: "Discounts updated successfully" });
  } catch (error) {
    console.error("Error updating discounts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all unique discount types from DB
export const getDiscountTypes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT discType FROM zhrdiscount ORDER BY discType ASC");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No discount types found" });
    }

    // Extract the discType values into an array
    const types = rows.map(row => row.discType);

    res.json({ types });
  } catch (error) {
    console.error("Error fetching discount types:", error);
    res.status(500).json({ message: "Server error" });
  }
};
