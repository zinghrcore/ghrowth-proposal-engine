const { pool, poolConnect } = require('../config/db'); // ✅ destructure pool and poolConnect

// ✅ Get all modules
exports.getAllModules = async (req, res) => {
  try {
    await poolConnect; // ensure connection
    const result = await pool.request().query(`
      SELECT modId, modName, modDesc, modFeatureList, modObjective,
             pkgPro, pkgProPlus, pkgGrowth, displayOrder,
             PriceINR, PriceUSD
      FROM zhrmodulelist
      ORDER BY modId ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get single module by ID
exports.getModuleById = async (req, res) => {
  try {
    await poolConnect;
    const { id } = req.params;
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM zhrmodulelist WHERE modId = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Add a new module
exports.createModule = async (req, res) => {
  try {
    await poolConnect;
    const { modName, modDesc, modFeatureList, modObjective } = req.body;

    if (!modName || !modDesc) {
      return res.status(400).json({ message: 'Module name and description are required' });
    }

    const result = await pool.request()
      .input('modName', modName)
      .input('modDesc', modDesc)
      .input('modFeatureList', modFeatureList || '')
      .input('modObjective', modObjective || '')
      .query(`
        INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective)
        VALUES (@modName, @modDesc, @modFeatureList, @modObjective);
        SELECT SCOPE_IDENTITY() AS insertId;
      `);

    res.status(201).json({ message: 'Module added successfully', modId: result.recordset[0].insertId });
  } catch (err) {
    console.error('Error creating module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update single module
exports.updateModule = async (req, res) => {
  try {
    await poolConnect;
    const { id } = req.params;
    const { modName, modDesc, modFeatureList, modObjective } = req.body;

    const existing = await pool.request()
      .input('id', id)
      .query('SELECT * FROM zhrmodulelist WHERE modId = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await pool.request()
      .input('modName', modName)
      .input('modDesc', modDesc)
      .input('modFeatureList', modFeatureList)
      .input('modObjective', modObjective)
      .input('id', id)
      .query(`
        UPDATE zhrmodulelist
        SET modName=@modName,
            modDesc=@modDesc,
            modFeatureList=@modFeatureList,
            modObjective=@modObjective
        WHERE modId=@id
      `);

    res.json({ message: 'Module updated successfully' });
  } catch (err) {
    console.error('Error updating module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete a module
exports.deleteModule = async (req, res) => {
  try {
    await poolConnect;
    const { id } = req.params;
    const existing = await pool.request()
      .input('id', id)
      .query('SELECT * FROM zhrmodulelist WHERE modId = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await pool.request()
      .input('id', id)
      .query('DELETE FROM zhrmodulelist WHERE modId = @id');

    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    console.error('Error deleting module:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Bulk update modules
exports.updateModulesBulk = async (req, res) => {
  try {
    await poolConnect;
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({ message: 'Modules array is required' });
    }

    const promises = modules.map(async (mod) => {
      if (mod.modId) {
        const existing = await pool.request()
          .input('modId', mod.modId)
          .query('SELECT * FROM zhrmodulelist WHERE modId = @modId');

        if (existing.recordset.length > 0) {
          return pool.request()
            .input('modName', mod.modName)
            .input('modDesc', mod.modDesc)
            .input('modFeatureList', mod.modFeatureList || '')
            .input('modObjective', mod.modObjective || '')
            .input('pkgPro', mod.pkgPro || 'Not included')
            .input('pkgProPlus', mod.pkgProPlus || 'Not included')
            .input('pkgGrowth', mod.pkgGrowth || 'Not included')
            .input('modId', mod.modId)
            .query(`
              UPDATE zhrmodulelist
              SET modName=@modName,
                  modDesc=@modDesc,
                  modFeatureList=@modFeatureList,
                  modObjective=@modObjective,
                  pkgPro=@pkgPro,
                  pkgProPlus=@pkgProPlus,
                  pkgGrowth=@pkgGrowth
              WHERE modId=@modId
            `);
        } else {
          return pool.request()
            .input('modName', mod.modName)
            .input('modDesc', mod.modDesc)
            .input('modFeatureList', mod.modFeatureList || '')
            .input('modObjective', mod.modObjective || '')
            .input('pkgPro', mod.pkgPro || 'Not included')
            .input('pkgProPlus', mod.pkgProPlus || 'Not included')
            .input('pkgGrowth', mod.pkgGrowth || 'Not included')
            .query(`
              INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective, pkgPro, pkgProPlus, pkgGrowth)
              VALUES (@modName,@modDesc,@modFeatureList,@modObjective,@pkgPro,@pkgProPlus,@pkgGrowth)
            `);
        }
      } else {
        return pool.request()
          .input('modName', mod.modName)
          .input('modDesc', mod.modDesc)
          .input('modFeatureList', mod.modFeatureList || '')
          .input('modObjective', mod.modObjective || '')
          .input('pkgPro', mod.pkgPro || 'Not included')
          .input('pkgProPlus', mod.pkgProPlus || 'Not included')
          .input('pkgGrowth', mod.pkgGrowth || 'Not included')
          .query(`
            INSERT INTO zhrmodulelist (modName, modDesc, modFeatureList, modObjective, pkgPro, pkgProPlus, pkgGrowth)
            VALUES (@modName,@modDesc,@modFeatureList,@modObjective,@pkgPro,@pkgProPlus,@pkgGrowth)
          `);
      }
    });

    await Promise.all(promises);
    res.json({ message: 'Modules updated successfully' });
  } catch (err) {
    console.error('Error updating modules in bulk:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Feature Comparison API
exports.getFeatureComparison = async (req, res) => {
  try {
    await poolConnect;
    const packagesResult = await pool.request()
      .query(`SELECT pkgId, pkgName, pkgLabel, pkgDesc, pkgPrice FROM zhrpackagelist ORDER BY pkgId ASC`);
    const packages = packagesResult.recordset;

    const planBenefits = [];
    packages.forEach(pkg => {
      if (pkg.pkgDesc) {
        pkg.pkgDesc.split(',').forEach(feature => {
          const trimmed = feature.trim();
          if (!planBenefits.find(f => f.feature === trimmed)) planBenefits.push({ feature: trimmed });
        });
      }
    });

    const modulesResult = await pool.request()
      .query(`
        SELECT modId, modName, modDesc, modObjective, pkgPro, pkgProPlus, pkgGrowth, PriceINR, PriceUSD
        FROM zhrmodulelist
        ORDER BY displayOrder ASC
      `);
    const modulesRows = modulesResult.recordset;

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

    res.json({ packages, modules: [...planBenefitsModules, ...modulesArray] });
  } catch (err) {
    console.error("Error fetching feature comparison:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get module counts per plan
exports.getModuleCounts = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT
        SUM(CASE WHEN pkgPro = 'Included' THEN 1 ELSE 0 END) AS Pro,
        SUM(CASE WHEN pkgProPlus = 'Included' THEN 1 ELSE 0 END) AS ProPlus,
        SUM(CASE WHEN pkgGrowth = 'Included' THEN 1 ELSE 0 END) AS GHROWTH
      FROM zhrmodulelist
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching module counts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update inclusion status for a specific module and package
exports.updateModulePackageStatus = async (req, res) => {
  try {
    await poolConnect;
    const { moduleName, packageName, status } = req.body;

    if (!moduleName || !packageName || !status) {
      return res.status(400).json({ message: "moduleName, packageName, and status are required" });
    }

    let columnName;
    switch (packageName.toUpperCase()) {
      case "ZINGHR PRO": columnName = "pkgPro"; break;
      case "ZINGHR PRO PLUS": columnName = "pkgProPlus"; break;
      case "ZINGHR GHROWTH": columnName = "pkgGrowth"; break;
      default: return res.status(400).json({ message: "Invalid package name" });
    }

    const newStatus = status === "included" ? "Included" : "Not included";

    const result = await pool.request()
      .input('newStatus', newStatus)
      .input('moduleName', moduleName)
      .query(`UPDATE zhrmodulelist SET ${columnName} = @newStatus WHERE modName = @moduleName`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json({ message: "Module inclusion status updated successfully", moduleName, packageName, newStatus });
  } catch (error) {
    console.error("❌ Error updating module package status:", error);
    res.status(500).json({ message: "Server error while updating module status" });
  }
};