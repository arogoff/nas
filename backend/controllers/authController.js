const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    // If no user found, return invalid credentials
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Make sure password_hash field exists
    if (!user.password_hash) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare plaintext password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate access token (short life)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token (long life)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
      user.id,
      refreshToken,
      expiresAt,
    ]);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Check if refresh token exists in DB
    const [rows] = await db.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const storedToken = rows[0];

    // Check if token has expired
    if (new Date(storedToken.expires_at) < new Date()) {
      // Remove expired token
      await db.query('DELETE FROM refresh_tokens WHERE id = ?', [storedToken.id]);
      return res.status(403).json({ message: 'Refresh token expired' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Get user info
      const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

      if (userRows.length === 0) {
        return res.status(403).json({ message: 'User not found' });
      }

      const user = userRows[0];

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, is_admin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken });
    } catch (jwtError) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};