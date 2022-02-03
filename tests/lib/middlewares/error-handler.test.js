'use strict'

const { NotFoundError } = require('@lib/api-errors')
const errorHandler = require('@lib/middlewares/error-handler')

describe('api/middlewares/error-handler.js', () => {
  let req, res

  beforeEach(() => {
    req = {}
    res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
  })

  describe('#errorHandler', () => {
    it('should set status code to 500 if an Error instance is received', () => {
      const error = new Error('test-error')
      errorHandler(error, req, res)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(500)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: {
          code: 'InternalServerError',
          message: 'test-error'
        }
      })
    })

    it('should set status code to 404 for invalid argument errors', () => {
      const error = new NotFoundError('property')
      errorHandler(error, req, res)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(404)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: {
          code: 'NotFoundError',
          message: 'property'
        }
      })
    })

    it('should set response message to an empty string if no message from errors', () => {
      const error = new NotFoundError('')
      errorHandler(error, req, res)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(404)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: {
          code: 'NotFoundError',
          message: ''
        }
      })
    })
  })
})
