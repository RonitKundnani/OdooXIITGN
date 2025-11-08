const bcrypt = require("bcrypt");
const { pool } = require("../config/database");
const { bcryptSaltRounds } = require("../config/app");
const { generateEmployeeId } = require("../utils/idGenerator");
const companyModel = require("../models/companyModel");
const userModel = require("../models/userModel");
const employeeModel = require("../models/employeeModel");
const systemLogModel = require("../models/systemLogModel");

async function getAllEmployees(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const employees = await employeeModel.getAllEmployees(company_id, pool);

    return res.json({
      ok: true,
      employees
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const employee = await employeeModel.getEmployeeById(id, company_id, pool);

    if (!employee) {
      return res.status(404).json({ ok: false, error: "Employee not found" });
    }

    return res.json({
      ok: true,
      employee
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function updateEmployee(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const {
      // user fields
      first_name,
      last_name,
      email,
      // user_profiles fields
      phone,
      date_of_birth,
      gender,
      marital_status,
      personal_email,
      address,
      nationality,
      // employment_details fields
      department,
      job_position,
      location,
      // admin info
      admin_user_id
    } = req.body;

    if (!admin_user_id) {
      return res.status(400).json({ ok: false, error: "admin_user_id is required" });
    }

    // Check if employee exists
    const employeeExists = await employeeModel.getUserById(id, connection);
    if (!employeeExists) {
      return res.status(404).json({ ok: false, error: "Employee not found" });
    }

    // Get the user making the request
    const requestingUser = await employeeModel.getUserById(admin_user_id, connection);
    if (!requestingUser) {
      return res.status(404).json({ ok: false, error: "Requesting user not found" });
    }

    // Verify they're from same company
    if (requestingUser.company_id !== employeeExists.company_id) {
      return res.status(403).json({ ok: false, error: "Cannot update employee from different company" });
    }

    // Authorization check: Only admin or the employee themselves can update
    const isAdmin = requestingUser.role === 'admin' || requestingUser.role === 'hr_officer';
    const isSelf = requestingUser.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ 
        ok: false, 
        error: "You don't have permission to update this employee's profile" 
      });
    }

    // Update users table (name and email)
    await employeeModel.updateUser(
      id,
      first_name,
      last_name,
      email,
      connection
    );

    // Update user_profiles
    await employeeModel.updateUserProfile(
      id,
      phone,
      date_of_birth,
      gender,
      marital_status,
      personal_email,
      address,
      nationality,
      connection
    );

    // Update employment_details
    await employeeModel.updateEmploymentDetails(
      id,
      department,
      job_position,
      location,
      connection
    );

    // Log the action
    await systemLogModel.createSystemLog(
      admin_user_id || id,
      employeeExists.company_id,
      'EMPLOYEE_UPDATED',
      `Employee ${employeeExists.first_name} ${employeeExists.last_name} (${id}) profile updated`,
      'employee',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Employee updated successfully"
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

async function addEmployee(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      year_of_joining,
      // user_profiles fields
      phone,
      date_of_birth,
      gender,
      marital_status,
      personal_email,
      address,
      nationality,
      profile_picture,
      // employment_details fields
      department,
      job_position,
      manager_id,
      location,
      date_of_joining,
      work_schedule,
      // financial_details fields
      bank_name,
      account_number,
      ifsc_code,
      pan_number,
      uan_number,
      // admin info (who is adding this employee)
      admin_user_id
    } = req.body;

    // Validate required fields
    if (!admin_user_id || !email || !password || !first_name || !last_name || !role || !year_of_joining) {
      return res.status(400).json({ 
        ok: false, 
        error: "Required fields: admin_user_id, email, password, first_name, last_name, role, year_of_joining" 
      });
    }

    const validRoles = ['admin', 'hr_officer', 'payroll_officer', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ ok: false, error: "Invalid role" });
    }

    // Get admin user's company_id
    const adminUser = await employeeModel.getUserById(admin_user_id, connection);
    if (!adminUser) {
      return res.status(404).json({ ok: false, error: "Admin user not found" });
    }

    const company_id = adminUser.company_id;

    // Get company details
    const companyRows = await companyModel.findCompanyById(company_id, connection);
    if (!companyRows.length) {
      return res.status(404).json({ ok: false, error: "Company not found" });
    }

    // Check if email already exists for this company
    const existing = await userModel.findUserByCompanyAndEmail(company_id, email, connection);
    if (existing.length) {
      return res.status(409).json({ ok: false, error: "Email already registered for this company" });
    }

    // Validate manager_id if provided
    if (manager_id) {
      const managerExists = await employeeModel.checkUserExists(manager_id, company_id, connection);
      if (!managerExists) {
        return res.status(404).json({ ok: false, error: "Invalid manager_id" });
      }
    }

    // Generate employee ID
    const employee_id = await generateEmployeeId(
      first_name, 
      last_name, 
      year_of_joining, 
      companyRows[0].company_code, 
      connection
    );

    // Hash password
    const password_hash = await bcrypt.hash(password, bcryptSaltRounds);

    // 1. Insert into users table
    await userModel.createUser(
      employee_id, 
      company_id, 
      email, 
      password_hash, 
      first_name, 
      last_name, 
      role, 
      connection
    );

    // 2. Insert into user_profiles table
    await employeeModel.createUserProfile(
      employee_id,
      phone,
      date_of_birth,
      gender,
      marital_status,
      personal_email,
      address,
      nationality,
      profile_picture,
      connection
    );

    // 3. Insert into employment_details table
    await employeeModel.createEmploymentDetails(
      employee_id,
      department,
      job_position,
      manager_id,
      location,
      date_of_joining,
      work_schedule,
      connection
    );

    // 4. Insert into financial_details table
    await employeeModel.createFinancialDetails(
      employee_id,
      bank_name,
      account_number,
      ifsc_code,
      pan_number,
      uan_number,
      connection
    );

    // 5. Insert into user_settings table
    await userModel.createUserSettings(employee_id, connection);

    // 6. Log the action
    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'EMPLOYEE_ADDED',
      `New employee ${first_name} ${last_name} (${employee_id}) added to company by ${adminUser.first_name} ${adminUser.last_name}`,
      'employee',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Employee added successfully",
      employee: {
        id: employee_id,
        company_id,
        email,
        first_name,
        last_name,
        role,
        department,
        job_position
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee
};
