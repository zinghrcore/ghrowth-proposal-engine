const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

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
const readinessRoutes = require("./routes/readinessRoutes");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Swagger config ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZHR Proposal Engine API',
      version: '1.0.0',
      description: 'API documentation for ZHR Proposal Engine',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./server.js', './routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI route
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Optional: raw JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- Serve static proposal PDFs ---
app.use('/uploads/proposals', express.static(path.join(__dirname, 'uploads/proposals')));

// --- Routes ---
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/approvals', approvalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/regions', regionRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/readiness", readinessRoutes);

// Same APIs exposed under sub-path prefix for ingress setups that do not rewrite.
app.use('/zhrproposalengine/api/customers', customerRoutes);
app.use('/zhrproposalengine/api/auth', authRoutes);
app.use('/zhrproposalengine/api/packages', packageRoutes);
app.use('/zhrproposalengine/api/proposals', proposalRoutes);
app.use('/zhrproposalengine/api/upload', uploadRouter);
app.use('/zhrproposalengine/api/approvals', approvalRoutes);
app.use('/zhrproposalengine/api/reports', reportRoutes);
app.use('/zhrproposalengine/api/regions', regionRoutes);
app.use('/zhrproposalengine/api/modules', moduleRoutes);
app.use('/zhrproposalengine/api/discounts', discountRoutes);
app.use('/zhrproposalengine/api/readiness', readinessRoutes);

// ✅ TEST DATABASE CONNECTION
/**
 * @openapi
 * /test-db:
 *   get:
 *     summary: Test database connection
 *     description: Checks whether the app can connect to SQL Server
 *     responses:
 *       200:
 *         description: Database connection successful
 *       500:
 *         description: Database connection failed
 */
app.get("/test-db", async (req, res) => {
  try {
    const db = require("./config/db");
    await db.poolConnect;
const result = await db.pool.request().query('SELECT 1 AS test');
    res.json(result.recordset);
  } catch (error) {
    console.error("DB Test Error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// --- Serve React production build (Docker / same-origin deploy) ---
const frontendBuild = path.join(__dirname, '../frontend/build');
const APP_BASE_PATH = '/zhrproposalengine';
if (fs.existsSync(frontendBuild)) {
  // Serve static files both at root and at sub-path.
  app.use(express.static(frontendBuild));
  app.use(APP_BASE_PATH, express.static(frontendBuild));

  app.use((req, res, next) => {
    // Let API and static asset routes pass through.
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/swagger')) {
      return next();
    }
    if (req.path.startsWith(`${APP_BASE_PATH}/api`) || req.path.startsWith(`${APP_BASE_PATH}/uploads`) || req.path.startsWith(`${APP_BASE_PATH}/swagger`)) {
      return next();
    }

    // SPA fallback for root and sub-path routing.
    if (req.path === '/' || req.path.startsWith(APP_BASE_PATH)) {
      return res.sendFile(path.join(frontendBuild, 'index.html'));
    }

    return next();
  });
} else {
  /**
   * @openapi
   * /:
   *   get:
   *     summary: Check server status
   *     responses:
   *       200:
   *         description: Server is running
   */
  app.get('/', (req, res) => {
    res.send('Server is running 🚀 (no frontend build — run `npm run build` in frontend)');
  });
}

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));