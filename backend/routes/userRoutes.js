const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Only admins can manage users
router.post('/users', authenticateToken, requireAdmin, usersController.createUser);
router.get('/users', authenticateToken, requireAdmin, usersController.listUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router;
