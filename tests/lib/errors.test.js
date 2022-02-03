'use strict'

const {
  ServiceError,
  NotFoundError,
  BusinessLogicError,
  UnresolvedError,
  DuplicateKeyError
} = require('@lib/errors')

describe('lib/errors', function () {
  describe('ServiceError', function () {
    it('should be an instance of Error', function () {
      const error = new ServiceError('message')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toEqual('ServiceError')
      expect(error.message).toEqual('message')
    })
  })

  describe('NotFoundError', function () {
    it('should instantiate NotFoundError error with custom message', function () {
      const error = new NotFoundError('blah')

      expect(error).toBeInstanceOf(ServiceError)
      expect(error.name).toEqual('NotFoundError')
      expect(error.message).toEqual('blah')
    })
  })

  describe('BusinessLogicError', function () {
    it('should instantiate BusinessLogicError error', function () {
      const error = new BusinessLogicError('blah')

      expect(error).toBeInstanceOf(ServiceError)
      expect(error.name).toEqual('BusinessLogicError')
      expect(error.message).toEqual('blah')
    })
  })

  describe('UnresolvedError', function () {
    it('should instantiate UnresolvedError error', function () {
      const error = new UnresolvedError('blah')

      expect(error).toBeInstanceOf(ServiceError)
      expect(error.name).toEqual('UnresolvedError')
      expect(error.message).toEqual('blah')
    })
  })

  describe('DuplicateKeyError', function () {
    it('should instantiate DuplicateKeyError error', function () {
      const error = new DuplicateKeyError('blah')

      expect(error).toBeInstanceOf(ServiceError)
      expect(error.name).toEqual('DuplicateKeyError')
      expect(error.message).toEqual('blah')
    })
  })
})
