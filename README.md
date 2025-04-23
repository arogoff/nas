# Custom NAS Software (Node.js + React + Samba)

🚀 Build your own powerful NAS system with user accounts, file sharing, and Samba network access.

---

## Features

- User authentication (JWT + Refresh Tokens)
- Admin panel for user management
- Share creation and access control (read, write, owner)
- Upload, download, delete files
- Multi-folder navigation
- API Rate limiting
- Notifications system
- File previews (images, text files)
- Auto-generate Samba config files
- Full audit logging

---

## Setup

1. Clone this repo:

```bash
git clone https://your-repo-link
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=nas_db
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
```

4. Initialize MariaDB

Run the SQL script:
```bash
mysql -u root -p < database.sql
```

5. Start server
```bash
npm run dev
```