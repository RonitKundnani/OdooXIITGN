async function createSystemLog(user_id, company_id, action, description, module, connection) {
  await connection.query(
    "INSERT INTO system_logs (user_id, company_id, action, description, module) VALUES (?, ?, ?, ?, ?)",
    [user_id, company_id, action, description, module]
  );
}

module.exports = { createSystemLog };
