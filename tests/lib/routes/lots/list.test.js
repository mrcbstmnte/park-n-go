'use strict'

const express = require('express')
const supertest = require('supertest')

const LotController = require('@lib/controllers/lot')
const Route = require('@routes/lots/list')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/lot')

describe('Lot list route', () => {
  /**
   * @type {Route}
   */
  let route

  /**
   * @type {supertest}
   */
  let request
  let req

  beforeAll(() => {
    const router = express.Router()
    const context = {
      controllers: {
        lot: new LotController()
      }
    }

    route = new Route(router, context)
    route.setupRoutes()

    const app = createMockServer(route.router)

    request = (body) => supertest(app)
      .get('/lots')
      .send(body)
  })

  beforeEach(() => {
    req = {}

    route.controller
      .list
      .mockResolvedValue([])
  })

  describe('success', () => {
    it('should respond with 200 if lot listing was successful', async () => {
      const response = await request(req.body).expect(200)

      expect(response.body).toStrictEqual({
        ok: true,
        lots: []
      })

      expect(route.controller.list).toHaveBeenCalledTimes(1)
    })
  })
})
