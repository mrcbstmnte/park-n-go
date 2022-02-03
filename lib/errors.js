'use strict'

/**
 * Base contact error
 */
class ServiceError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Object not found error
 */
class NotFoundError extends ServiceError {}

/**
 * Business logic related error
 */
class BusinessLogicError extends ServiceError {}

/**
 * Unresolved error
 */
class UnresolvedError extends ServiceError {}

/**
 * Duplicate key error
 */
class DuplicateKeyError extends ServiceError {}

module.exports = {
  ServiceError,
  NotFoundError,
  BusinessLogicError,
  UnresolvedError,
  DuplicateKeyError
}
