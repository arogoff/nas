const db = require('../models/db');
const log = require('../models/logging');

// User creates a share
exports.createShare = async (req, res) => {
    const { share_name, share_path } = req.body;
    if (!share_name || !share_path) return res.status(400).json({ message: 'Missing share name or path' });
  
    const connection = await db.getConnection();
    await connection.beginTransaction();
  
    try {
      const [result] = await connection.query(
        'INSERT INTO shares (share_name, share_path, created_by) VALUES (?, ?, ?)',
        [share_name, share_path, req.user.id]
      );
      const shareId = result.insertId;
  
      await connection.query(
        'INSERT INTO share_user_access (share_id, user_id, access_level) VALUES (?, ?, ?)',
        [shareId, req.user.id, 'owner']
      );
  
      await connection.commit();
      res.status(201).json({ message: 'Share created successfully' });
    } catch (err) {
      await connection.rollback();
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  };
  

// List shares user has access to
exports.listShares = async (req, res) => {
  try {
    const [shares] = await db.query(`
      SELECT s.id, s.share_name, s.share_path
      FROM shares s
      JOIN share_user_access sua ON s.id = sua.share_id
      WHERE sua.user_id = ?
    `, [req.user.id]);

    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin deletes a share
exports.deleteShare = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM shares WHERE id = ?', [id]);
    res.json({ message: 'Share deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a user to a share
exports.addUserToShare = async (req, res) => {
  const { id } = req.params; // Share ID
  const { user_id, access_level } = req.body;
  if (!user_id) return res.status(400).json({ message: 'Missing user_id' });

  try {
    await db.query('INSERT INTO share_user_access (share_id, user_id, access_level) VALUES (?, ?, ?)', [
      id,
      user_id,
      access_level || 'write',
    ]);
    res.json({ message: 'User added to share successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
