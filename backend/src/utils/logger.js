// src/utils/logger.js (ESM)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// log levels
const LOG_LEVELS = Object.freeze({
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
});

const createLogEntry = (level, message, meta = {}) => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  ...meta
});

const writeLog = (entry, filename = 'combined.log') => {
  const file = path.join(logsDir, filename);
  fs.appendFile(file, JSON.stringify(entry) + '\n', err => {
    if (err) console.error('❌ Error writing to log file:', err);
  });
};

class Logger {
  error(message, meta = {}) {
    const entry = createLogEntry(LOG_LEVELS.ERROR, message, meta);
    console.error(`❌ [ERROR] ${message}`, meta);
    writeLog(entry, 'error.log');
    writeLog(entry);
  }

  warn(message, meta = {}) {
    const entry = createLogEntry(LOG_LEVELS.WARN, message, meta);
    console.warn(`⚠️  [WARN] ${message}`, meta);
    writeLog(entry);
  }

  info(message, meta = {}) {
    const entry = createLogEntry(LOG_LEVELS.INFO, message, meta);
    console.log(`ℹ️  [INFO] ${message}`, meta);
    writeLog(entry);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry(LOG_LEVELS.DEBUG, message, meta);
      console.log(`🐛 [DEBUG] ${message}`, meta);
      writeLog(entry);
    }
  }
}

export default new Logger();
