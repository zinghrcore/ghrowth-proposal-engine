import { pool, poolConnect } from "../config/db.js";


// Get all discounts
export const getAllDiscounts = async (req, res) => {
  try {

    await poolConnect;

    const result = await pool.request()
      .query("SELECT * FROM zhrdiscount");

    res.json(result.recordset);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};



// Get discount by code
export const getDiscountByCode = async (req, res) => {

  const { code } = req.params;

  try {

    await poolConnect;

    const result = await pool.request()
      .input("code", code)
      .query(`
        SELECT *
        FROM zhrdiscount
        WHERE discCode=@code
      `);

    const rows = result.recordset;

    if (rows.length === 0)
      return res.status(404).json({ message: "Invalid discount code" });

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



// Create discount
export const createDiscount = async (req, res) => {

  const { discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth } = req.body;

  try {

    await poolConnect;

    const result = await pool.request()
      .input("discCode", discCode)
      .input("discDesc", discDesc)
      .input("discPercentage", discPercentage)
      .input("discType", discType)
      .input("validFromMonth", validFromMonth)
      .input("validToMonth", validToMonth)
      .query(`
        INSERT INTO zhrdiscount
        (discCode,discDesc,discPercentage,discType,validFromMonth,validToMonth)
        OUTPUT INSERTED.discId
        VALUES
        (@discCode,@discDesc,@discPercentage,@discType,@validFromMonth,@validToMonth)
      `);

    const discId = result.recordset[0].discId;

    const newDiscount = await pool.request()
      .input("discId", discId)
      .query(`
        SELECT *
        FROM zhrdiscount
        WHERE discId=@discId
      `);

    res.status(201).json(newDiscount.recordset[0]);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};



// Update discount
export const updateDiscount = async (req, res) => {

  const { id } = req.params;
  const { discCode, discDesc, discPercentage, discType, validFromMonth, validToMonth } = req.body;

  try {

    await poolConnect;

    await pool.request()
      .input("discCode", discCode)
      .input("discDesc", discDesc)
      .input("discPercentage", discPercentage)
      .input("discType", discType)
      .input("validFromMonth", validFromMonth)
      .input("validToMonth", validToMonth)
      .input("discId", id)
      .query(`
        UPDATE zhrdiscount
        SET discCode=@discCode,
            discDesc=@discDesc,
            discPercentage=@discPercentage,
            discType=@discType,
            validFromMonth=@validFromMonth,
            validToMonth=@validToMonth
        WHERE discId=@discId
      `);

    const updated = await pool.request()
      .input("discId", id)
      .query(`
        SELECT *
        FROM zhrdiscount
        WHERE discId=@discId
      `);

    res.json(updated.recordset[0]);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};



// Delete discount
export const deleteDiscount = async (req, res) => {

  const { id } = req.params;

  try {

    await poolConnect;

    await pool.request()
      .input("discId", id)
      .query(`
        DELETE FROM zhrdiscount
        WHERE discId=@discId
      `);

    res.json({ message: "Discount deleted successfully" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};



// Bulk update discounts
export const updateDiscountsBulk = async (req, res) => {

  try {

    const { discounts } = req.body;

    if (!Array.isArray(discounts))
      return res.status(400).json({ message: "Discounts array is required" });

    await poolConnect;

    const promises = discounts.map(async (disc) => {

      if (disc.discId) {

        await pool.request()
          .input("discCode", disc.discCode)
          .input("discDesc", disc.discDesc)
          .input("discPercentage", disc.discPercentage)
          .input("discType", disc.discType)
          .input("validFromMonth", disc.validFromMonth)
          .input("validToMonth", disc.validToMonth)
          .input("discId", disc.discId)
          .query(`
            UPDATE zhrdiscount
            SET discCode=@discCode,
                discDesc=@discDesc,
                discPercentage=@discPercentage,
                discType=@discType,
                validFromMonth=@validFromMonth,
                validToMonth=@validToMonth
            WHERE discId=@discId
          `);

      } else {

        await pool.request()
          .input("discCode", disc.discCode)
          .input("discDesc", disc.discDesc)
          .input("discPercentage", disc.discPercentage)
          .input("discType", disc.discType)
          .input("validFromMonth", disc.validFromMonth)
          .input("validToMonth", disc.validToMonth)
          .query(`
            INSERT INTO zhrdiscount
            (discCode,discDesc,discPercentage,discType,validFromMonth,validToMonth)
            VALUES
            (@discCode,@discDesc,@discPercentage,@discType,@validFromMonth,@validToMonth)
          `);

      }

    });

    await Promise.all(promises);

    res.json({ message: "Discounts updated successfully" });

  } catch (error) {

    console.error("Error updating discounts:", error);
    res.status(500).json({ message: "Server error" });

  }

};



// Get discount types
export const getDiscountTypes = async (req, res) => {

  try {

    await poolConnect;

    const result = await pool.request()
      .query(`
        SELECT DISTINCT discType
        FROM zhrdiscount
        ORDER BY discType ASC
      `);

    const rows = result.recordset;

    if (!rows.length)
      return res.status(404).json({ message: "No discount types found" });

    const types = rows.map(row => row.discType);

    res.json({ types });

  } catch (error) {

    console.error("Error fetching discount types:", error);
    res.status(500).json({ message: "Server error" });

  }

};