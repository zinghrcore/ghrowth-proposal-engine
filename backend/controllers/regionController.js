const db = require("../config/db");

// GET all regions
const getRegions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM regions ORDER BY name ASC");
    res.json(rows);
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
        await db.query("UPDATE regions SET name=?, currency=?, pricing=? WHERE id=?", [
          region.name,
          region.currency,
          region.pricing || `Pricing in ${region.currency}`,
          region.id,
        ]);
      } else {
        // Insert new
        await db.query("INSERT INTO regions (name, currency, pricing) VALUES (?, ?, ?)", [
          region.name,
          region.currency,
          region.pricing || `Pricing in ${region.currency}`,
        ]);
      }
    }
    res.json({ message: "Regions updated successfully" });
  } catch (err) {
    console.error("❌ Error updating regions:", err);
    res.status(500).json({ message: "Failed to update regions", error: err.message });
  }
};

// DELETE a region by name (admin)
const deleteRegion = async (req, res) => {
  const regionId = req.params.id;

  try {
    const query = "DELETE FROM regions WHERE id = ?";
    db.query(query, [regionId], (err, result) => {
      if (err) {
        console.error("Error deleting region:", err);
        return res.status(500).json({ message: "Failed to delete region" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Region not found" });
      }

      res.json({ message: "Region deleted successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getRegions, updateRegions, deleteRegion };
