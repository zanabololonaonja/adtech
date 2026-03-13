const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...meta
    }));
  },
  error: (message, error = null, meta = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error ? (error.message || error) : null,
      stack: error ? error.stack : null,
      ...meta
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...meta
    }));
  }
};

module.exports = logger;
