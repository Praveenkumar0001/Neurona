// src/middleware/upload.middleware.js (ESM)
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root (…/src/middleware -> go up two levels)
const ROOT_DIR = path.resolve(__dirname, '../../');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const DIRS = [
  UPLOADS_DIR,
  path.join(UPLOADS_DIR, 'reports'),
  path.join(UPLOADS_DIR, 'avatars'),
  path.join(UPLOADS_DIR, 'documents'),
];

// ensure upload directories exist
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    let dir = path.join(UPLOADS_DIR, 'documents');
    if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
      dir = path.join(UPLOADS_DIR, 'avatars');
    } else if (file.fieldname === 'document') {
      dir = path.join(UPLOADS_DIR, 'documents');
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

// file filter
const allowedMimes = config?.upload?.allowedMimeTypes ?? [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`), false);
};

// multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: Number(config?.upload?.maxFileSize ?? 5 * 1024 * 1024), // default 5 MB
  },
  fileFilter,
});

// helpers to build consistent error responses
const tooLargeMsg = (maxBytes) =>
  `File too large. Max size: ${(Number(maxBytes) / 1024 / 1024).toFixed(1)}MB`;

// Single file upload middleware factory
export const uploadSingle = (fieldName) => (req, res, next) => {
  const run = upload.single(fieldName);
  run(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: tooLargeMsg(config?.upload?.maxFileSize ?? 5 * 1024 * 1024),
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Multiple files upload middleware factory
export const uploadMultiple = (fieldName, maxCount = 5) => (req, res, next) => {
  const run = upload.array(fieldName, maxCount);
  run(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: tooLargeMsg(config?.upload?.maxFileSize ?? 5 * 1024 * 1024),
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: `Too many files. Max: ${maxCount}`,
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Delete file helper (accepts web path '/uploads/...' or fs path)
export const deleteFile = (p) => {
  try {
    if (!p) return false;
    const fsPath = p.startsWith('/uploads/')
      ? path.join(ROOT_DIR, p.replace('/', ''))
      : path.isAbsolute(p)
        ? p
        : path.join(ROOT_DIR, p);
    if (fs.existsSync(fsPath)) {
      fs.unlinkSync(fsPath);
      return true;
    }
    return false;
  } catch (e) {
    // avoid crashing on cleanup; log if you want
    console.error('Error deleting file:', e);
    return false;
  }
};
