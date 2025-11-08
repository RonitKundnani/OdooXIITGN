require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { testConnection, pool } = require("./db");

const app = express();
const port = 5000;

// CORS setup
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// --- Helper function to generate custom ID ---
async function generateEmployeeId(first_name, last_name, year_of_joining, company_code, connection) {
  const nameCode = (first_name.substring(0, 2) + last_name.substring(0, 2)).toUpperCase();
  const yearCode = year_of_joining.toString();
  const prefix = `${company_code}${nameCode}${yearCode}`;

  const [rows] = await connection.query(
    "SELECT COUNT(*) AS count FROM users WHERE id LIKE ?",
    [`${prefix}%`]
  );

  const serial = (rows[0].count + 1).toString().padStart(4, "0");
  return `${prefix}${serial}`;
}



// --- Health check ---
app.get("/", (req, res) => {
  res.send("✅ API is running properly!");
});

// --- Test DB connection ---
app.get("/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/company-signup", async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      company_name,
      company_code,
      company_logo,
      email,
      password,
      first_name,
      last_name,
      year_of_joining
    } = req.body;

    // --- Validate required fields
    if (![company_name, company_code, email, password, first_name, last_name, year_of_joining].every(Boolean)) {
      return res.status(400).json({ ok: false, error: "All fields are required" });
    }

    // --- Check for existing company
    const [existingCompany] = await connection.query(
      "SELECT id FROM companies WHERE company_code = ? OR company_name = ?",
      [company_code, company_name]
    );
    if (existingCompany.length) {
      return res.status(409).json({ ok: false, error: "Company already exists" });
    }

    // --- 1️⃣ Insert company
    const [companyResult] = await connection.query(
      "INSERT INTO companies (company_code, company_name, company_logo) VALUES (?, ?, ?)",
      [company_code, company_name, company_logo || null]
    );
    const company_id = companyResult.insertId;

    // --- Generate employee ID for admin
    const adminId = await generateEmployeeId(first_name, last_name, year_of_joining, company_code, connection);

    // --- Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // --- 2️⃣ Insert admin user
    await connection.query(
      `INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [adminId, company_id, email, password_hash, first_name, last_name, "admin"]
    );

    // --- 3️⃣ Insert default user profile
    await connection.query(`INSERT INTO user_profiles (user_id) VALUES (?)`, [adminId]);

    // --- 4️⃣ Insert employment details
    await connection.query(
      `INSERT INTO employment_details (user_id, department, job_position, date_of_joining)
       VALUES (?, ?, ?, CURDATE())`,
      [adminId, "Administration", "Company Admin"]
    );

    // --- 5️⃣ Insert blank financial record
    await connection.query(`INSERT INTO financial_details (user_id) VALUES (?)`, [adminId]);

    // --- 6️⃣ Insert user settings
    await connection.query(
      `INSERT INTO user_settings (user_id, email_notifications, theme, language)
       VALUES (?, TRUE, 'light', 'en')`,
      [adminId]
    );

    // --- 7️⃣ Log system action
    await connection.query(
      `INSERT INTO system_logs (user_id, company_id, action, description, module)
       VALUES (?, ?, 'COMPANY_CREATED', 'New company and admin user created', 'auth')`,
      [adminId, company_id]
    );

    // --- Commit all
    await connection.commit();

    return res.json({
      ok: true,
      message: "Company and admin created successfully",
      company: {
        id: company_id,
        code: company_code,
        name: company_name
      },
      admin_user_id: adminId
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
});


// --- Signup route ---
app.post("/signup", async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { company_id, email, password, first_name, last_name, role, year_of_joining } = req.body;

    if (![company_id, email, password, first_name, last_name, role, year_of_joining].every(Boolean)) {
      return res.status(400).json({ ok: false, error: "All fields are required" });
    }

    const validRoles = ['admin', 'hr_officer', 'payroll_officer', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ ok: false, error: "Invalid role" });
    }

    // Check if company exists
    const [companyRows] = await connection.query("SELECT * FROM companies WHERE id = ?", [company_id]);
    if (!companyRows.length) {
      return res.status(404).json({ ok: false, error: "Invalid company_id" });
    }

    // Check if email already exists for this company
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE company_id = ? AND email = ?",
      [company_id, email]
    );
    if (existing.length) {
      return res.status(409).json({ ok: false, error: "Email already registered for this company" });
    }

    // Generate custom employee ID
    const id = await generateEmployeeId(first_name, last_name, year_of_joining, companyRows[0].company_code, connection);

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 1️⃣ Insert into users
    await connection.query(
      "INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
      [id, company_id, email, password_hash, first_name, last_name, role]
    );

    // 2️⃣ Insert default user profile
    await connection.query("INSERT INTO user_profiles (user_id) VALUES (?)", [id]);

    // 3️⃣ Insert employment details
    await connection.query(
      "INSERT INTO employment_details (user_id, department, job_position, date_of_joining) VALUES (?, ?, ?, CURDATE())",
      [id, "Unassigned", "New Hire"]
    );

    // 4️⃣ Insert empty financial record
    await connection.query("INSERT INTO financial_details (user_id) VALUES (?)", [id]);

    // 5️⃣ Insert user settings
    await connection.query(
      "INSERT INTO user_settings (user_id, email_notifications, theme, language) VALUES (?, TRUE, 'light', 'en')",
      [id]
    );

    // 6️⃣ Add system log
    await connection.query(
      "INSERT INTO system_logs (user_id, company_id, action, description, module) VALUES (?, ?, 'USER_CREATED', 'New user account created via signup API', 'auth')",
      [id, company_id]
    );

    // Commit all queries
    await connection.commit();

    return res.json({ ok: true, message: "Signup successful", user_id: id });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
});

// --- Login route ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Email and password are required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ ok: false, error: "User not found" });

    const user = rows[0];
    if (!user.is_active) return res.status(403).json({ ok: false, error: "Account is inactive" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ ok: false, error: "Invalid password" });

    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id]);

    return res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        last_login: new Date().toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Start Server ---
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
