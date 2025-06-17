import { NODE_ENV } from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    status: err.status || 500,
    message: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation error';
    error.details = err.details;
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    error.status = 409;
    error.message = 'Resource already exists';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    error.status = 400;
    error.message = 'Invalid reference to related resource';
  }

  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

    res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
};

export {
  errorHandler
};
