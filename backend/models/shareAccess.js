const db = require('./db');

// requiredLevels is an array, like ['read', 'write', 'owner']
exports.hasAccessToShare = async (userId, shareId, requiredLevels = ['read', 'write', 'owner']) => {
  const [rows] = await db.query(
    `SELECT access_level FROM share_user_access 
     WHERE user_id = ? AND share_id = ?`,
    [userId, shareId]
  );
  if (rows.length === 0) return false;

  return requiredLevels.includes(rows[0].access_level);
};
