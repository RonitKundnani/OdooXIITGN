const bcrypt = require("bcrypt");
const { pool } = require("../config/database");
const { bcryptSaltRounds } = require("../config/app");
const { generateEmployeeId } = require("../utils/idGenerator");
const companyModel = require("../models/companyModel");
const userModel = require("../models/userModel");
const systemLogModel = require("../models/systemLogModel");

async function companySignup(req, res) {
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

    if (![company_name, company_code, email, password, first_name, last_name, year_of_joining].every(Boolean)) {
      return res.status(400).json({ ok: false, error: "All fields are required" });
    }

    const existingCompany = await companyModel.findCompanyByCodeOrName(company_code, company_name, connection);
    if (existingCompany.length) {
      return res.status(409).json({ ok: false, error: "Company already exists" });
    }

    const company_id = await companyModel.createCompany(company_code, company_name, company_logo, connection);
    const adminId = await generateEmployeeId(first_name, last_name, year_of_joining, company_code, connection);
    const password_hash = await bcrypt.hash(password, bcryptSaltRounds);

    await userModel.createUser(adminId, company_id, email, password_hash, first_name, last_name, "admin", connection);
    await userModel.createUserProfile(adminId, connection);
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

async function signup(req, res) {
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

    const companyRows = await companyModel.findCompanyById(company_id, connection);
    if (!companyRows.length) {
      return res.status(404).json({ ok: false, error: "Invalid company_id" });
    }

    const existing = await userModel.findUserByCompanyAndEmail(company_id, email, connection);
    if (existing.length) {
      return res.status(409).json({ ok: false, error: "Email already registered for this company" });
    }

    const id = await generateEmployeeId(first_name, last_name, year_of_joining, companyRows[0].company_code, connection);
    const password_hash = await bcrypt.hash(password, bcryptSaltRounds);

    await userModel.createUser(id, company_id, email, password_hash, first_name, last_name, role, connection);
    await userModel.createUserProfile(id, connection);
    await userModel.createEmploymentDetails(id, "Unassigned", "New Hire", connection);
    await userModel.createFinancialDetails(id, connection);
    await userModel.createUserSettings(id, connection);
    await systemLogModel.createSystemLog(id, company_id, 'USER_CREATED', 'New user account created via signup API', 'auth', connection);

    await connection.commit();

    return res.json({ ok: true, message: "Signup successful", user_id: id });
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
  signup,
  login
};
