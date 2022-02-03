'use strict'

const {
  NotFoundError,
  BusinessLogicError
} = require('@lib/errors')
const apiErrors = require('@lib/api-errors')
const helpers = require('@lib/helpers')

describe('Helpers', () => {
  describe('#resolveApiError', () => {
    it('should resolve not found error', () => {
      const error = new NotFoundError()
      const apiError = helpers.resolveApiError(error)

      expect(apiError).toBeInstanceOf(apiErrors.NotFoundError)
    })

    it('should resolve business logic error', () => {
      const error = new BusinessLogicError('max_blah')
      const apiError = helpers.resolveApiError(error)

      expect(apiError).toBeInstanceOf(apiErrors.ConflictError)
    })

    it('should resolve internal server errors', () => {
      const error = new Error()
      const apiError = helpers.resolveApiError(error)

      expect(apiError).toBeInstanceOf(apiErrors.InternalServerError)
    })
  })
})
