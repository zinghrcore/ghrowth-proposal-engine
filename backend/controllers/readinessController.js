const { pool, poolConnect } = require("../config/db");

exports.getSections = async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request().query(`
      SELECT id, title, description
      FROM checklist_main
      ORDER BY id
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Sections Error:", error);
    res.status(500).json({ error: "Failed to fetch checklist sections" });
  }
};

exports.getItems = async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request().query(`
      SELECT id, main_id, item_text, tags, is_completed
      FROM checklist_sub
      ORDER BY main_id, id
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(500).json({ error: "Failed to fetch checklist items" });
  }
};