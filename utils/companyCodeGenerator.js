/**
 * Generate company code from company name
 * Examples:
 * - "Odoo India" -> "OI"
 * - "Tech Solutions" -> "TS"
 * - "ABC Corporation" -> "AC"
 * - "Microsoft" -> "MI"
 */
function generateCompanyCode(companyName) {
  if (!companyName || typeof companyName !== 'string') {
    throw new Error('Invalid company name');
  }

  // Remove special characters and extra spaces
  const cleanName = companyName.trim().replace(/[^a-zA-Z\s]/g, '');
  
  // Split into words
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    throw new Error('Company name must contain at least one word');
  }

  let code = '';

  if (words.length === 1) {
    // Single word: take first 2 characters
    // "Microsoft" -> "MI"
    code = words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words: take first letter of each word (up to 10 chars)
    // "Odoo India" -> "OI"
    // "Tech Solutions Private Limited" -> "TSPL"
    code = words
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 10);
  }

  return code;
}

/**
 * Generate unique company code by checking database
 * If code exists, append number: OI -> OI2, OI3, etc.
 */
async function generateUniqueCompanyCode(companyName, connection) {
  const baseCode = generateCompanyCode(companyName);
  let code = baseCode;
  let counter = 2;

  // Check if code already exists
  while (true) {
    const [rows] = await connection.query(
      'SELECT id FROM companies WHERE company_code = ?',
      [code]
    );

    if (rows.length === 0) {
      // Code is unique
      return code;
    }

    // Code exists, try with number suffix
    code = baseCode + counter;
    counter++;

    // Safety limit to prevent infinite loop
    if (counter > 100) {
      throw new Error('Unable to generate unique company code');
    }
  }
}

module.exports = {
  generateCompanyCode,
  generateUniqueCompanyCode,
};
