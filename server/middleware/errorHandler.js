export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.stack || err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({ success: false, error: 'Resource already exists' });
  }

  res.status(500).json({ success: false, error: 'Internal server error' });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
