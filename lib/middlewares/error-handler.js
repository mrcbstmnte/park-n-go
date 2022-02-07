'use strict'

const { ApiError, InternalServerError } = require('@lib/api-errors')

/**
 * Error handle middleware
 */
function errorHandler (error, _req, res, _next) {
  if (!(error instanceof ApiError)) {
    error = new InternalServerError(error.message)
  }

  res.status(error.statusCode).json({
    ok: false,
    error: {
      code: error.code,
      message: error.message || ''
    }
  })
}

module.exports = errorHandler
