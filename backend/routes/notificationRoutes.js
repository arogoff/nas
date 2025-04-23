const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All notification routes require login
router.get('/', authenticateToken, notificationController.getNotifications);

module.exports = router;
