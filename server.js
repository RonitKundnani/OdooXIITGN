require('dotenv').config();
const express = require("express");
const { testConnection } = require("./config/database");
const { port } = require("./config/app");
const corsMiddleware = require("./middlewares/cors");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

// app.use("/", healthRoutes);
app.use("/", authRoutes);
app.use("/", employeeRoutes);
app.use("/", attendanceRoutes);

app.listen(port, async () => {
  try {
    await testConnection();
    console.log("✅ MySQL connection successful");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message || err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${port}`);
});
