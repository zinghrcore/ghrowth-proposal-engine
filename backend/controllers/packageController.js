const db = require('../config/db');

// Fetch all packages
exports.getPackages = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM zhrPackageList');

    const packages = rows.map(pkg => ({
      id: pkg.pkgId,
      name: pkg.pkgName,
      description: pkg.pkgDesc
        ? pkg.pkgDesc.split(',').map(item => item.trim()).filter(item => item)
        : []
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
    const packages = req.body.packages;

    for (const pkg of packages) {
      // Ensure description is array and remove empty features
      const description = Array.isArray(pkg.description)
        ? pkg.description.map(f => f.trim()).filter(f => f)
        : [];

      await db.query(
        'UPDATE zhrPackageList SET pkgName = ?, pkgDesc = ? WHERE pkgId = ?',
        [pkg.name, description.join(', '), pkg.id]
      );
    }

    res.json({ message: 'Packages updated successfully' });
  } catch (error) {
    console.error('Error updating packages:', error);
    res.status(500).json({ message: 'Failed to update packages' });
  }
};
