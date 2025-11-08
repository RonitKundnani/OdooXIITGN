const bcrypt = require("bcrypt");
const { pool } = require("../config/database");
const { bcryptSaltRounds } = require("../config/app");
const { generateEmployeeId } = require("../utils/idGenerator");
const { generateUniqueCompanyCode } = require("../utils/companyCodeGenerator");
const companyModel = require("../models/companyModel");
const userModel = require("../models/userModel");
const systemLogModel = require("../models/systemLogModel");

async function companySignup(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      company_name,
      email,
      password,
      first_name,
      last_name,
      phone,
      year_of_joining
    } = req.body;

    if (![company_name, email, password, first_name, last_name, year_of_joining].every(Boolean)) {
      return res.status(400).json({ ok: false, error: "All required fields must be provided" });
    }

    // Check if company name already exists
    const existingCompany = await companyModel.findCompanyByName(company_name, connection);
    if (existingCompany.length) {
      return res.status(409).json({ ok: false, error: "Company name already exists" });
    }

    // Auto-generate unique company code from company name
    const company_code = await generateUniqueCompanyCode(company_name, connection);

    const company_id = await companyModel.createCompany(company_code, company_name, connection);
    const adminId = await generateEmployeeId(first_name, last_name, year_of_joining, company_code, connection);
    const password_hash = await bcrypt.hash(password, bcryptSaltRounds);

    await userModel.createUser(adminId, company_id, email, password_hash, first_name, last_name, "admin", connection);
    await userModel.createUserProfile(adminId, phone, connection);
    await userModel.createEmploymentDetails(adminId, "Administration", "Company Admin", connection);
    await userModel.createFinancialDetails(adminId, connection);
    await userModel.createUserSettings(adminId, connection);
    await systemLogModel.createSystemLog(adminId, company_id, 'COMPANY_CREATED', 'New company and admin user created', 'auth', connection);

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
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Email and password are required" });
  }

  try {
    const rows = await userModel.findUserByEmail(email, pool);
    if (!rows.length) return res.status(401).json({ ok: false, error: "User not found" });

    const user = rows[0];
    if (!user.is_active) return res.status(403).json({ ok: false, error: "Account is inactive" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ ok: false, error: "Invalid password" });

    await userModel.updateLastLogin(user.id, pool);

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
}

module.exports = {
  companySignup,
  login
};
