const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, groupController.createGroup);
router.post('/addUser', authenticateToken, groupController.addUserToGroup);
router.post('/assignShare', authenticateToken, groupController.assignGroupToShare);

module.exports = router;
