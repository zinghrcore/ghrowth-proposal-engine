const { pool, poolConnect } = require('../config/db'); // ✅ destructure MSSQL pool

// Fetch all packages
exports.getPackages = async (req, res) => {
  try {
    await poolConnect; // ✅ ensure connection is ready

    const result = await pool.request().query('SELECT * FROM zhrPackageList');
    const rows = result.recordset;

    const packages = rows.map(pkg => ({
      id: pkg.pkgId,
      name: pkg.pkgName,
      label: pkg.pkgLabel || "",
      description: pkg.pkgDesc
        ? pkg.pkgDesc.split(',').map(item => item.trim()).filter(item => item)
        : [],
      price: pkg.pkgPrice || 0
    }));

    res.json(packages);

  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Failed to fetch packages' });
  }
};


// Update all packages (Admin only)
exports.updatePackages = async (req, res) => {
  try {
    await poolConnect; // ✅ ensure connection is ready

    const packages = req.body.packages;

    for (const pkg of packages) {
      const description = Array.isArray(pkg.description)
        ? pkg.description.map(f => f.trim()).filter(f => f)
        : [];

      await pool.request()
        .input('pkgName', pkg.name)
        .input('pkgLabel', pkg.label || '')
        .input('pkgDesc', description.join(', '))
        .input('pkgPrice', pkg.price || 0)
        .input('pkgId', pkg.id)
        .query(`
          UPDATE zhrPackageList
          SET pkgName = @pkgName,
              pkgLabel = @pkgLabel,
              pkgDesc = @pkgDesc,
              pkgPrice = @pkgPrice
          WHERE pkgId = @pkgId
        `);
    }

    res.json({ message: 'Packages updated successfully' });

  } catch (error) {
    console.error('Error updating packages:', error);
    res.status(500).json({ message: 'Failed to update packages' });
  }
};