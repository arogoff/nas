const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const { logFileActivity } = require('../models/logging');
const { hasAccessToShare } = require('../models/shareAccess');

// Upload
exports.uploadFile = async (req, res) => {
  const { shareId } = req.params;
  const { subfolder } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  const allowed = await hasAccessToShare(req.user.id, shareId, ['write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission to upload'});

  try {
    const safeSubfolder = path.normalize(subfolder || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const uploadPath = path.join(__dirname, '..', 'uploads', shareId.toString(), safeSubfolder);

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    const filePath = path.join(uploadPath, file.originalname);
    fs.renameSync(file.path, filePath);

    await logFileActivity(shareId, req.user.id, 'upload', path.join(safeSubfolder, file.originalname));
    res.json({ message: 'File uploaded successfully' });

    messageText = "File uploaded successfully"
    await db.query(
      `INSERT INTO notifications (user_id, share_id, message) VALUES (?, ?, ?)`,
      [userId, shareId, messageText]
    );
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};


// Download
exports.downloadFile = async (req, res) => {
  const { shareId, filename } = req.params;
  const { subfolder } = req.body;

  const allowed = await hasAccessToShare(req.user.id, shareId, ['read', 'write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission to download from this share' });

  try {
    const safeSubfolder = path.normalize(subfolder || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const uploadPath = path.join(__dirname, '..', 'uploads', shareId.toString(), safeSubfolder);
    if (!fs.existsSync(uploadPath)) return res.status(404).json({ message: 'File not found' });

    await logFileActivity(shareId, req.user.id, 'download', filename);
    res.download(uploadPath);

    messageText = "File downloaded"
    await db.query(
      `INSERT INTO notifications (user_id, share_id, message) VALUES (?, ?, ?)`,
      [userId, shareId, messageText]
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Download failed' });
  }
};

// Delete
exports.deleteFile = async (req, res) => {
  const { shareId, filename } = req.params;
  const { subfolder } = req.body;

  const allowed = await hasAccessToShare(req.user.id, shareId, ['write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission to delete from this share' });

  try {
    const safeSubfolder = path.normalize(subfolder || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const uploadPath = path.join(__dirname, '..', 'uploads', shareId.toString(), safeSubfolder);
    if (!fs.existsSync(uploadPath)) return res.status(404).json({ message: 'File not found' });

    fs.unlinkSync(uploadPath);

    await logFileActivity(shareId, req.user.id, 'delete', filename);
    res.json({ message: 'File deleted successfully' });

    messageText = "File deleted successfully"
    await db.query(
      `INSERT INTO notifications (user_id, share_id, message) VALUES (?, ?, ?)`,
      [userId, shareId, messageText]
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.previewFile = async (req, res) => {
  const { shareId, filename } = req.params;
  const { subfolder } = req.query;

  const allowed = await hasAccessToShare(req.user.id, shareId, ['read', 'write', 'owner']);
  if (!allowed) return res.status(403).json({ message: 'No permission' });

  try {
    const safeSubfolder = path.normalize(subfolder || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(__dirname, '..', 'uploads', shareId.toString(), safeSubfolder, filename);
    
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    // Only allow certain file types (text, images)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'text/plain', 'application/json'];
    const mimeType = mime.lookup(filePath);

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ message: 'Preview not supported for this file type' });
    }

    res.type(mimeType).sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Preview failed' });
  }
};

