const db = require('../models/db');

exports.createGroup = async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Admins only' });
  const { name, description } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO groups (name, description) VALUES (?, ?)`,
      [name, description]
    );
    res.json({ id: result.insertId, name, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

exports.addUserToGroup = async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Admins only' });
  const { userId, groupId } = req.body;
  try {
    await db.query(
      `INSERT IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)`,
      [userId, groupId]
    );
    res.json({ message: 'User added to group' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add user to group' });
  }
};

exports.assignGroupToShare = async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Admins only' });
  const { shareId, groupId, accessLevel } = req.body;
  try {
    await db.query(
      `INSERT INTO share_groups (share_id, group_id, access_level) VALUES (?, ?, ?)`,
      [shareId, groupId, accessLevel]
    );
    res.json({ message: 'Group assigned to share' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign group to share' });
  }
};
