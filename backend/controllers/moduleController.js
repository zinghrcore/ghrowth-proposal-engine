const db = require('../config/db');

// ✅ Get all modules
exports.getAllModules = async (req, res) => {
  try {
    const [modules] = await db.query(`
      SELECT modId, modName, modDesc, modFeatureList, modObjective,
             pkgPro, pkgProPlus, pkgGrowth, displayOrder,
             PriceINR, PriceUSD
      FROM zhrmodulelist
      ORDER BY modId ASC
    `);
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
        // Existing module, update
        const [existing] = await db.query('SELECT * FROM zhrmodulelist WHERE modId = ?', [mod.modId]);
        if (existing.length > 0) {
          return db.query(
            'UPDATE zhrmodulelist SET modName=?, modDesc=?, modFeatureList=?, modObjective=?, pkgPro=?, pkgProPlus=?, pkgGrowth=? WHERE modId=?',
            [
              mod.modName,
              mod.modDesc,
              mod.modFeatureList || '',
              mod.modObjective || '',
              mod.pkgPro || 'Not included',
              mod.pkgProPlus || 'Not included',
              mod.pkgGrowth || 'Not included',
              mod.modId
            ]
          );
        } else {
          // If somehow modId doesn't exist, insert as new
          return db.query(
            'INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective, pkgPro, pkgProPlus, pkgGrowth) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              mod.modName,
              mod.modDesc,
              mod.modFeatureList || '',
              mod.modObjective || '',
              mod.pkgPro || 'Not included',
              mod.pkgProPlus || 'Not included',
              mod.pkgGrowth || 'Not included'
            ]
          );
        }
      } else {
        // New module, insert
        return db.query(
          'INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective, pkgPro, pkgProPlus, pkgGrowth) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            mod.modName,
            mod.modDesc,
            mod.modFeatureList || '',
            mod.modObjective || '',
            mod.pkgPro || 'Not included',
            mod.pkgProPlus || 'Not included',
            mod.pkgGrowth || 'Not included'
          ]
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

// ✅ Feature Comparison API (Updated to use actual package names)
exports.getFeatureComparison = async (req, res) => {
  try {
    // 1️⃣ Get all packages
    const [packages] = await db.query(`
      SELECT pkgId, pkgName, pkgLabel, pkgDesc, pkgPrice 
      FROM zhrpackagelist 
      ORDER BY pkgId ASC
    `);

    // 2️⃣ Split pkgDesc into individual features for Plan Benefits
    const planBenefits = [];
    packages.forEach(pkg => {
      if (pkg.pkgDesc) {
        pkg.pkgDesc.split(',').forEach(feature => {
          const trimmed = feature.trim();
          if (!planBenefits.find(f => f.feature === trimmed)) {
            planBenefits.push({ feature: trimmed });
          }
        });
      }
    });

    // 3️⃣ Get all modules
    const [modulesRows] = await db.query(`
      SELECT modId, modName, modDesc, modObjective, pkgPro, pkgProPlus, pkgGrowth, PriceINR, PriceUSD
      FROM zhrmodulelist
      ORDER BY 
  FIELD(modObjective, 'Foundation', 'Talent Acquisition', 'Organisation Management', 'Workforce Productivity', 'Talent Management', 'Employee Engagement', 'Business Enhancers', 'Agentic AI'),
  displayOrder ASC`);

    // 4️⃣ Map modules with exact package names (important fix)
    const modulesArray = modulesRows.map(mod => ({
      modId: mod.modId,
      modName: mod.modName,
      modDesc: mod.modDesc,
      category: mod.modObjective || "Other",
      PriceINR: mod.PriceINR,
      PriceUSD: mod.PriceUSD,
      packages: {
        "ZingHR PRO": mod.pkgPro?.toLowerCase() === 'included' ? 'included' : 'not included',
        "ZingHR PRO PLUS": mod.pkgProPlus?.toLowerCase() === 'included' ? 'included' : 'not included',
        "ZingHR GHROWTH": mod.pkgGrowth?.toLowerCase() === 'included' ? 'included' : 'not included'
      }
    }));

    // 5️⃣ Combine Plan Benefits as pseudo-modules
    const planBenefitsModules = planBenefits.map(f => ({
      modId: `plan-${f.feature}`,
      modName: f.feature,
      modDesc: '',
      category: "Plan Benefits",
      packages: packages.reduce((acc, pkg) => {
        acc[pkg.pkgName] = pkg.pkgDesc.includes(f.feature) ? 'included' : 'not included';
        return acc;
      }, {})
    }));

    // 6️⃣ Send response
    res.json({
      packages,
      modules: [...planBenefitsModules, ...modulesArray]
    });

  } catch (err) {
    console.error("Error fetching feature comparison:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get module counts per plan
exports.getModuleCounts = async (req, res) => {
  try {
    const [counts] = await db.query(`
      SELECT
        SUM(CASE WHEN pkgPro = 'Included' THEN 1 ELSE 0 END) AS Pro,
        SUM(CASE WHEN pkgProPlus = 'Included' THEN 1 ELSE 0 END) AS ProPlus,
        SUM(CASE WHEN pkgGrowth = 'Included' THEN 1 ELSE 0 END) AS GHROWTH
      FROM zhrmodulelist
    `);

    res.json(counts[0]); // returns { Pro: 14, ProPlus: 19, GHROWTH: 22 }
  } catch (err) {
    console.error('Error fetching module counts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// ✅ Update inclusion status for a specific module and package (for admin toggle)
// ✅ Toggle module inclusion/exclusion for a specific package
exports.updateModulePackageStatus = async (req, res) => {
  try {
    const { moduleName, packageName, status } = req.body;

    if (!moduleName || !packageName || !status) {
      return res.status(400).json({ message: "moduleName, packageName, and status are required" });
    }

    // Map package name to column
    let columnName;
    switch (packageName.toUpperCase()) {
      case "ZINGHR PRO":
        columnName = "pkgPro";
        break;
      case "ZINGHR PRO PLUS":
        columnName = "pkgProPlus";
        break;
      case "ZINGHR GHROWTH":
        columnName = "pkgGrowth";
        break;
      default:
        return res.status(400).json({ message: "Invalid package name" });
    }

    const newStatus = status === "included" ? "Included" : "Not included";

    // Update the module record
    const [result] = await db.query(
      `UPDATE zhrmodulelist SET ${columnName} = ? WHERE modName = ?`,
      [newStatus, moduleName]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json({
      message: "Module inclusion status updated successfully",
      moduleName,
      packageName,
      newStatus,
    });
  } catch (error) {
    console.error("❌ Error updating module package status:", error);
    res.status(500).json({ message: "Server error while updating module status" });
  }
};

