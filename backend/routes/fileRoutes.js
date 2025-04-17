const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const upload = multer({ dest: 'tmp/' }); // Temporary folder, then move to final

// Upload file to share
router.post('/shares/:shareId/files', authenticateToken, upload.single('file'), fileController.uploadFile);

// Download file from share
router.get('/shares/:shareId/files/:filename', authenticateToken, fileController.downloadFile);

// Delete file from share
router.delete('/shares/:shareId/files/:filename', authenticateToken, fileController.deleteFile);

module.exports = router;
