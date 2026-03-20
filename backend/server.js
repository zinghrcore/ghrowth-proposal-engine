const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Route imports
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require("./routes/packageRoutes");
const proposalRoutes = require('./routes/proposalRoutes');
const uploadRouter = require('./routes/upload');
const moduleRoutes = require('./routes/moduleRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const reportRoutes = require('./routes/reportRoutes');
const regionRoutes = require('./routes/regionRoutes');
const discountRoutes = require("./routes/discountRoutes");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Serve static proposal PDFs ---
app.use('/uploads/proposals', express.static(path.join(__dirname, 'uploads/proposals')));

// --- Routes ---
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/proposals', proposalRoutes);
//app.use('/api/modules', moduleRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/approvals', approvalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/regions', regionRoutes);
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/discounts", discountRoutes);

// --- Root route for testing ---
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// ✅ TEST DATABASE CONNECTION
app.get("/test-db", async (req, res) => {
  try {
    const db = require("./config/db");

    const result = await db.request().query("SELECT 1 AS test");

    res.json(result.recordset);
  } catch (error) {
    console.error("DB Test Error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
