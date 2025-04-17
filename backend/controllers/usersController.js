const db = require('../models/db');
const bcrypt = require('bcryptjs');

// Admin creates a user
exports.createUser = async (req, res) => {
  const { username, password, is_admin } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing username or password' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)', [
      username,
      passwordHash,
      is_admin || false,
    ]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin lists all users
exports.listUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, is_admin, created_at FROM users');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin deletes a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
