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

module.exports = { generateEmployeeId };
