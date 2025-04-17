const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const { logFileActivity } = require('../models/logging');
const { hasAccessToShare } = require('../models/shareAccess');

// Upload
exports.uploadFile = async (req, res) => {
  const { shareId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  // Check access
  const allowed = await hasAccessToShare(req.user.id, shareId, ['write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission to upload to this share' });

  try {
    const uploadPath = path.join(__dirname, '..', 'uploads', shareId.toString());
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    const filePath = path.join(uploadPath, file.originalname);
    fs.renameSync(file.path, filePath);

    await logFileActivity(shareId, req.user.id, 'upload', file.originalname);
    res.json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// Download
exports.downloadFile = async (req, res) => {
  const { shareId, filename } = req.params;

  const allowed = await hasAccessToShare(req.user.id, shareId, ['read', 'write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission to download from this share' });

  try {
    const filePath = path.join(__dirname, '..', 'uploads', shareId.toString(), filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    await logFileActivity(shareId, req.user.id, 'download', filename);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Download failed' });
  }
};

// Delete
exports.deleteFile = async (req, res) => {
  const { shareId, filename } = req.params;

  const allowed = await hasAccessToShare(req.user.id, shareId, ['write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission to delete from this share' });

  try {
    const filePath = path.join(__dirname, '..', 'uploads', shareId.toString(), filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    fs.unlinkSync(filePath);

    await logFileActivity(shareId, req.user.id, 'delete', filename);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
};
