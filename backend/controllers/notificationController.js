const db = require('../models/db');

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query(
        `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json({ message: 'Notification marked as read and removed' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  };
  
