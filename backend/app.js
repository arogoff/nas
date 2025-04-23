const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/userRoutes');
const sharesRoutes = require('./routes/sharesRoutes');
const fileRoutes = require('./routes/fileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const groupRoutes = require('./routes/groupRoutes');

const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');

app.use(express.json());

// Routes
app.use('/api', authRoutes, authLimiter);
app.use('/api/notifications', notificationRoutes, authLimiter);
app.use('/api/audit', auditRoutes, authLimiter);
app.use('/api', usersRoutes, authLimiter, apiLimiter);
app.use('/api', sharesRoutes, authLimiter, apiLimiter);
app.use('/api', fileRoutes, authLimiter, apiLimiter);
app.use('/api/groups', groupRoutes, authLimiter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);
  
    try {
      // Check if refresh token exists in DB
      const [rows] = await db.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
      if (rows.length === 0) return res.sendStatus(403);
  
      jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
  
        // Generate new access token
        const accessToken = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );
  
        res.json({ accessToken });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  