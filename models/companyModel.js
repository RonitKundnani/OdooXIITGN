const { pool } = require('../config/database');

async function findCompanyByCodeOrName(company_code, company_name, connection) {
  const [rows] = await connection.query(
    "SELECT id FROM companies WHERE company_code = ? OR company_name = ?",
    [company_code, company_name]
  );
  return rows;
}

async function createCompany(company_code, company_name, company_logo, connection) {
  const [result] = await connection.query(
    "INSERT INTO companies (company_code, company_name, company_logo) VALUES (?, ?, ?)",
    [company_code, company_name, company_logo || null]
  );
  return result.insertId;
}

async function findCompanyById(company_id, connection) {
  const [rows] = await connection.query("SELECT * FROM companies WHERE id = ?", [company_id]);
  return rows;
}

module.exports = {
  findCompanyByCodeOrName,
  createCompany,
  findCompanyById
};
