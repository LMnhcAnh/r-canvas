// server/controllers/authController.js
const pool = require("../db");
const bcrypt = require("bcryptjs");

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      uid: user.username,
      nickname: user.full_name || user.username,
      email: user.email,
      isAdmin: user.is_admin,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setActiveUser = async (req, res) => {
  const { uid, nickname, email, isAdmin } = req.body;
  try {
    await pool.query(
      `INSERT INTO active_users (uid, nickname, email, is_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (uid) DO UPDATE SET timestamp = CURRENT_TIMESTAMP`,
      [uid, nickname, email, isAdmin]
    );
    res.json({ message: "Active user set" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeActiveUser = async (req, res) => {
  const { uid } = req.params;
  try {
    await pool.query("DELETE FROM active_users WHERE uid = $1", [uid]);
    res.json({ message: "Active user removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM active_users ORDER BY timestamp DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
