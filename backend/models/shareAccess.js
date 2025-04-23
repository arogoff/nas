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

exports.hasAccessToShare = async (userId, shareId, requiredAccess = 'read') => {
  // Check direct user permissions
  const [userPerms] = await db.query(
    `SELECT access_level FROM share_permissions WHERE user_id = ? AND share_id = ?`,
    [userId, shareId]
  );

  if (userPerms.length > 0) {
    // If user has owner/write/read access directly
    return checkAccessLevel(userPerms[0].access_level, requiredAccess);
  }

  // Check group permissions
  const [groupPerms] = await db.query(
    `SELECT sg.access_level
     FROM user_groups ug
     JOIN share_groups sg ON ug.group_id = sg.group_id
     WHERE ug.user_id = ? AND sg.share_id = ?`,
    [userId, shareId]
  );

  if (groupPerms.length > 0) {
    // If any group the user belongs to grants access
    return checkAccessLevel(groupPerms[0].access_level, requiredAccess);
  }

  return false;
};

function checkAccessLevel(userLevel, requiredLevel) {
  const levels = { 'read': 1, 'write': 2, 'owner': 3 };
  return levels[userLevel] >= levels[requiredLevel];
}