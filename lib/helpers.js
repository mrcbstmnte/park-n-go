'use strict'

const {
  NotFoundError,
  BusinessLogicError
} = require('@lib/errors')
const errors = require('@lib/api-errors')

/**
 * Resolves errors into API related error
 * @param {Object} error - Error to be resolved
 * @returns {Object} - API error
 */
exports.resolveApiError = function (error) {
  if (error instanceof NotFoundError) {
    return new errors.NotFoundError(error.message)
  }

  if (error instanceof BusinessLogicError) {
    return new errors.ConflictError(error.message)
  }

  return new errors.InternalServerError()
}

/**
 * Get error from validation
 * @param {Object[]} errors
 * @returns {GetErrorResult}
 */
exports.getError = function (errors) {
  if (!Array.isArray(errors)) {
    throw new Error('Errors must be a type of Array')
  }

  if (errors.length === 0) {
    throw new Error('Errors should contain at least 1 element')
  }

  const error = errors[0]

  let path = error.dataPath?.substr(1)

  if (error.keyword === 'required') {
    const missingProperty = error.params.missingProperty

    path = path !== '' ? `${path}.${missingProperty}` : missingProperty
  }

  if (error.keyword === 'additionalProperties') {
    const additionalProperty = error.params.additionalProperty

    path = path !== '' ? `${path}.${additionalProperty}` : additionalProperty
  }

  return {
    error: error,
    path: path
  }
}
