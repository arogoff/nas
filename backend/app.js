const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const sharesRoutes = require('./routes/sharesRoutes');
const fileRoutes = require('./routes/fileRoutes');

app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', sharesRoutes);
app.use('/api', fileRoutes);

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
  