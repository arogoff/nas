const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, auditController.getAuditLogs);
router.get('/my', authenticateToken, auditController.getUserAuditLogs);


module.exports = router;
