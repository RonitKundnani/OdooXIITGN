const { pool } = require("../config/database");

function healthCheck(req, res) {
  res.send("✅ API is running properly!");
}

async function dbCheck(req, res) {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  healthCheck,
  dbCheck
};
