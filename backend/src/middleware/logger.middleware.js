const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom logger middleware
exports.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown'
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.duration}`);
    }
    
    // Write to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error('Error writing to log file:', err);
    });
  });
  
  next();
};

// Error logger
exports.errorLogger = (err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      body: req.body
    }
  };
  
  const errorFile = path.join(logsDir, 'error.log');
  const errorLine = JSON.stringify(errorLog) + '\n';
  
  fs.appendFile(errorFile, errorLine, (err) => {
    if (err) console.error('Error writing to error log:', err);
  });
  
  next(err);
};