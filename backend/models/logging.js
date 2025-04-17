const db = require('./db');

exports.logFileActivity = async (shareId, userId, action, filename) => {
  await db.query(
    'INSERT INTO file_activity_logs (share_id, user_id, action, filename) VALUES (?, ?, ?, ?)',
    [shareId, userId, action, filename]
  );
};

exports.logAuditEvent = async (userId, action, details) => {
  await db.query(
    'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
    [userId, action, details]
  );
};
