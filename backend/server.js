const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Route imports
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const proposalRoutes = require('./routes/proposalRoutes'); // ✅ Added

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/proposals', proposalRoutes); // ✅ Connected proposal routes
app.use('/api/modules', require('./routes/moduleRoutes'));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
