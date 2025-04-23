const db = require('../models/db');

exports.getAuditLogs = async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    const [logs] = await db.query(
      `SELECT al.*, u.username, s.name AS share_name
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       JOIN shares s ON al.share_id = s.id
       ORDER BY al.timestamp DESC
       LIMIT 100`
    );
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

exports.getUserAuditLogs = async (req, res) => {
    try {
      const [logs] = await db.query(
        `SELECT al.*, s.name AS share_name
         FROM audit_logs al
         JOIN shares s ON al.share_id = s.id
         WHERE al.user_id = ?
         ORDER BY al.timestamp DESC
         LIMIT 50`,
        [req.user.id]
      );
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch your activity logs' });
    }
  };
  
