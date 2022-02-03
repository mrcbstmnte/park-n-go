'use strict'

/**
 * API error classes will be extending this class
 */
class ApiError extends Error {
  constructor (message) {
    super(message)

    Error.captureStackTrace(this, this.constructor)
  }
}

const API_ERRORS = {
  NotFoundError: 404,
  ConflictError: 409,
  InternalServerError: 500
}

/**
 * Will dynamically generate API error classes
 * Each API error class will have this following properties:
 *     - name - Name of the class
 *     - code - Same with the `name` this will be used when returning the error
 *     - statusCode - Status code for the error
 */
const apiErrors = Object.keys(API_ERRORS).reduce(function (error, name) {
  const statusCode = API_ERRORS[name]

  error[name] = class extends ApiError {}

  error[name].prototype.name = name
  error[name].prototype.code = name
  error[name].prototype.statusCode = statusCode

  return error
}, {})

module.exports = {
  ApiError,
  ...apiErrors
}
