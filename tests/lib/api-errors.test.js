'use strict'

const errors = require('@lib/api-errors')

describe('api/errors.js', () => {
  /**
   * A helper method so that the assertion will not
   * change regardless of the order
   * @param {any[]} items
   * @returns {any[]} Sorted items
   */
  function sort (items) {
    return items.slice().sort()
  }

  it('should create errors', () => {
    const apiErrors = sort(Object.keys(errors))

    expect(apiErrors).toEqual(sort([
      'ApiError',

      'ConflictError',
      'NotFoundError',
      'InternalServerError'
    ]))
  })

  describe('Base API error class', () => {
    it('should be an instance of Error', () => {
      const error = new errors.ApiError('message')
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('message')
    })
  })

  describe('API errors', () => {
    it('should be an instance of ApiError', () => {
      const apiErrors = Object.keys(errors).slice(1)

      apiErrors.forEach((apiError) => {
        const error = new errors[apiError]('message')
        expect(error).toBeInstanceOf(errors.ApiError)
        expect(error.message).toBe('message')
      })
    })
  })

  describe('InternalServerError', () => {
    it('should set `code` to `InternalServerError`', () => {
      const error = new errors.InternalServerError('err')
      expect(error.code).toBe('InternalServerError')
    })

    it('should set `statusCode` to 500', () => {
      const error = new errors.InternalServerError('err')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('ConflictError', () => {
    it('should set `code` to `ConflictError`', () => {
      const error = new errors.ConflictError('err')
      expect(error.code).toBe('ConflictError')
    })

    it('should set `statusCode` to 409', () => {
      const error = new errors.ConflictError('err')
      expect(error.statusCode).toBe(409)
    })
  })

  describe('NotFoundError', () => {
    it('should set `code` to `NotFoundError`', () => {
      const error = new errors.NotFoundError('err')
      expect(error.code).toBe('NotFoundError')
    })

    it('should set `statusCode` to 404', () => {
      const error = new errors.NotFoundError('err')
      expect(error.statusCode).toBe(404)
    })
  })
})
