const express = require('express');
const router = express.Router();
const sharesController = require('../controllers/sharesController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.post('/shares', authenticateToken, sharesController.createShare);
router.get('/shares', authenticateToken, sharesController.listShares);
router.delete('/shares/:id', authenticateToken, requireAdmin, sharesController.deleteShare);
router.post('/shares/:id/add-user', authenticateToken, sharesController.addUserToShare);

module.exports = router;
