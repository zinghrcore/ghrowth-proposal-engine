const { pool } = require("../config/db");

// GET all regions
const getRegions = async (req, res) => {
  try {

    const result = await pool.request().query(
      "SELECT * FROM regions ORDER BY name ASC"
    );

    res.json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching regions:", err);
    res.status(500).json({ message: "Failed to fetch regions", error: err.message });
  }
};


// PUT to update regions (admin)
const updateRegions = async (req, res) => {

  const { regions } = req.body;

  try {

    for (const region of regions) {

      if (region.id) {

        // Update existing
        await pool.request()
          .input("name", region.name)
          .input("currency", region.currency)
          .input("pricing", region.pricing || `Pricing in ${region.currency}`)
          .input("id", region.id)
          .query(`
            UPDATE regions
            SET name=@name,
                currency=@currency,
                pricing=@pricing
            WHERE id=@id
          `);

      } else {

        // Insert new
        await pool.request()
          .input("name", region.name)
          .input("currency", region.currency)
          .input("pricing", region.pricing || `Pricing in ${region.currency}`)
          .query(`
            INSERT INTO regions (name, currency, pricing)
            VALUES (@name, @currency, @pricing)
          `);

      }
    }

    res.json({ message: "Regions updated successfully" });

  } catch (err) {
    console.error("❌ Error updating regions:", err);
    res.status(500).json({ message: "Failed to update regions", error: err.message });
  }
};


// DELETE region
const deleteRegion = async (req, res) => {

  const regionId = req.params.id;

  try {

    const result = await pool.request()
      .input("id", regionId)
      .query("DELETE FROM regions WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Region not found" });
    }

    res.json({ message: "Region deleted successfully" });

  } catch (error) {

    console.error("Error deleting region:", error);
    res.status(500).json({ message: "Server error" });

  }
};

module.exports = { getRegions, updateRegions, deleteRegion };