const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Create log entry
const createLogEntry = (level, message, meta = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
};

// Write log to file
const writeLog = (logEntry, filename = 'combined.log') => {
  const logFile = path.join(logsDir, filename);
  const logLine = JSON.stringify(logEntry) + '\n';
  
  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

// Logger class
class Logger {
  error(message, meta = {}) {
    const logEntry = createLogEntry(LOG_LEVELS.ERROR, message, meta);
    console.error(`❌ [ERROR] ${message}`, meta);
    writeLog(logEntry, 'error.log');
    writeLog(logEntry, 'combined.log');
  }
  
  warn(message, meta = {}) {
    const logEntry = createLogEntry(LOG_LEVELS.WARN, message, meta);
    console.warn(`⚠️  [WARN] ${message}`, meta);
    writeLog(logEntry, 'combined.log');
  }
  
  info(message, meta = {}) {
    const logEntry = createLogEntry(LOG_LEVELS.INFO, message, meta);
    console.log(`ℹ️  [INFO] ${message}`, meta);
    writeLog(logEntry, 'combined.log');
  }
  
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = createLogEntry(LOG_LEVELS.DEBUG, message, meta);
      console.log(`🐛 [DEBUG] ${message}`, meta);
      writeLog(logEntry, 'combined.log');
    }
  }
}

module.exports = new Logger();