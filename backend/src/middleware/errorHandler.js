/**
 * Global Express Error Handling Middleware
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  // Handle malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_MALFORMED_JSON',
        message: 'Request payload contains malformed JSON.'
      }
    });
  }

  // Handle oversized entity
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'ERR_PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the maximum permitted size limit.'
      }
    });
  }

  // General application error
  const response = {
    success: false,
    error: {
      code: err.code || 'ERR_INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred while processing the request.'
    }
  };

  if (isDev && status >= 500) {
    response.error.stack = err.stack;
  }

  res.status(status).json(response);
}

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
}
