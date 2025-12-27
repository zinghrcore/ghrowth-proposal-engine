const db = require('../config/db');

// ✅ Get all modules
exports.getAllModules = async (req, res) => {
  try {
    const [modules] = await db.query('SELECT * FROM zhrmodulelist ORDER BY modId ASC');
    res.json(modules);
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get single module by ID
exports.getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [module] = await db.query('SELECT * FROM zhrmodulelist WHERE modId = ?', [id]);

    if (module.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module[0]);
  } catch (err) {
    console.error('Error fetching module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Add a new module
exports.createModule = async (req, res) => {
  try {
    const { modName, modDesc, modFeatureList, modObjective } = req.body;

    if (!modName || !modDesc) {
      return res.status(400).json({ message: 'Module name and description are required' });
    }

    const [result] = await db.query(
      'INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective) VALUES (?, ?, ?, ?)',
      [modName, modDesc, modFeatureList || '', modObjective || '']
    );

    res.status(201).json({ message: 'Module added successfully', modId: result.insertId });
  } catch (err) {
    console.error('Error creating module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update single module
exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { modName, modDesc, modFeatureList, modObjective } = req.body;

    const [existing] = await db.query('SELECT * FROM zhrmodulelist WHERE modId = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await db.query(
      'UPDATE zhrmodulelist SET modName=?, modDesc=?, modFeatureList=?, modObjective=? WHERE modId=?',
      [modName, modDesc, modFeatureList, modObjective, id]
    );

    res.json({ message: 'Module updated successfully' });
  } catch (err) {
    console.error('Error updating module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM zhrmodulelist WHERE modId = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await db.query('DELETE FROM zhrmodulelist WHERE modId = ?', [id]);
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    console.error('Error deleting module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Bulk update modules (used for dashboard edit modal)
exports.updateModulesBulk = async (req, res) => {
  try {
    const { modules } = req.body; // array of module objects with modId or tempId

    if (!Array.isArray(modules)) {
      return res.status(400).json({ message: 'Modules array is required' });
    }

    const promises = modules.map(async (mod) => {
      if (mod.modId) {
        // ✅ Existing module, update
        const [existing] = await db.query('SELECT * FROM zhrmodulelist WHERE modId = ?', [mod.modId]);
        if (existing.length > 0) {
          return db.query(
            'UPDATE zhrmodulelist SET modName=?, modDesc=?, modFeatureList=?, modObjective=? WHERE modId=?',
            [mod.modName, mod.modDesc, mod.modFeatureList || '', mod.modObjective || '', mod.modId]
          );
        } else {
          // If somehow modId doesn't exist, insert as new
          return db.query(
            'INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective) VALUES (?, ?, ?, ?)',
            [mod.modName, mod.modDesc, mod.modFeatureList || '', mod.modObjective || '']
          );
        }
      } else {
        // ✅ New module, insert
        return db.query(
          'INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective) VALUES (?, ?, ?, ?)',
          [mod.modName, mod.modDesc, mod.modFeatureList || '', mod.modObjective || '']
        );
      }
    });

    await Promise.all(promises);

    res.json({ message: 'Modules updated successfully' });
  } catch (err) {
    console.error('Error updating modules in bulk:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
