const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function saveUploadedFile(file) {
  ensureUploadsDir();
  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  return { filepath, filename };
}

function deleteFileSafe(filepath) {
  try {
    if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (_) {}
}

module.exports = { ensureUploadsDir, saveUploadedFile, deleteFileSafe };
