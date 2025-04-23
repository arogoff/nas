const fs = require('fs');
const path = require('path');
const db = require('../models/db');

exports.generateSambaConfig = async () => {
  const [shares] = await db.query('SELECT * FROM shares');

  let config = `[global]
workgroup = WORKGROUP
security = user
map to guest = Bad User
\n`;

  for (const share of shares) {
    const [users] = await db.query(
      `SELECT u.username FROM users u
       JOIN share_user_access sua ON u.id = sua.user_id
       WHERE sua.share_id = ?`, [share.id]);

    const validUsers = users.map(u => u.username).join(' ');

    config += `
[share_${share.id}]
  path = /path/to/uploads/${share.id}
  read only = no
  browsable = yes
  guest ok = no
  valid users = ${validUsers}
\n`;
  }

  fs.writeFileSync('/etc/samba/smb.conf', config);
};
