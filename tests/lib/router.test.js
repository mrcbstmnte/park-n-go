'use strict'

const express = require('express')
const path = require('path')

const apiRouter = require('@lib/router')

const APP_ROOT = path.resolve(__dirname, '../../')

describe('api/router.js', () => {
  let context

  const router = express.Router()

  beforeEach(() => {
    context = {}

    jest.spyOn(router, 'get')
      .mockResolvedValue()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should export setup', () => {
    expect(apiRouter.setup).toBeInstanceOf(Function)
  })

  describe('routes', () => {
    beforeEach(() => {
      apiRouter.setup(
        `${APP_ROOT}/tests/test-files/router/routes`,
        router,
        context
      )
    })

    it('should initialize all routes', () => {
      expect(router.get).toHaveBeenCalledTimes(2)

      expect(router.get).toHaveBeenNthCalledWith(1, '/cat')
      expect(router.get).toHaveBeenNthCalledWith(2, '/dog')
    })

    it('should throw if route is not export as a function', () => {
      expect(() => {
        apiRouter.setup(
          `${APP_ROOT}/tests/test-files/router/empty-route`,
          router,
          context
        )
      }).toThrow('empty-route.js is not exported as function')
    })

    it('should throw if route has not implemented `setupRoutes` interface', () => {
      expect(() => {
        apiRouter.setup(
          `${APP_ROOT}/tests/test-files/router/missing-setup`,
          router,
          context
        )
      }).toThrow('missing-setup.js does not have setupRoutes interface')
    })
  })
})
