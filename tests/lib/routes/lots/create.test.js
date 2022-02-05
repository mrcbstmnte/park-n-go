'use strict'

const express = require('express')
const supertest = require('supertest')

const LotController = require('@lib/controllers/lot')
const Route = require('@routes/lots/create')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/lot')

describe('Lot create route', () => {
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
      .post('/lot')
      .send(body)
  })

  beforeEach(() => {
    req = {
      body: {
        name: 'Lot A',
        entryPoints: 3
      }
    }

    route.controller
      .create
      .mockResolvedValue({
        id: 'lotId'
      })
  })

  describe('success', () => {
    it('should respond with 200 if lot creation was successful', async () => {
      const response = await request(req.body).expect(200)

      expect(response.body).toStrictEqual({
        ok: true,
        lot: {
          id: 'lotId'
        }
      })

      expect(route.controller.create).toHaveBeenCalledTimes(1)
      expect(route.controller.create).toHaveBeenCalledWith(
        'Lot A',
        3
      )
    })
  })

  describe('validation', () => {
    describe('name', () => {
      it('should respond with 409 if name is undefined', async () => {
        delete req.body.name

        await request(req.body).expect(409)
      })

      it('should respond with 409 if name is not a string', async () => {
        req.body.name = 123

        await request(req.body).expect(409)
      })

      it('should respond with 409 if name is an empty string', async () => {
        req.body.name = ''

        await request(req.body).expect(409)
      })
    })

    describe('entryPoints', () => {
      it('should respond with 409 if entryPoints is undefined', async () => {
        delete req.body.entryPoints

        await request(req.body).expect(409)
      })

      it('should respond with 409 if entryPoints is not a number', async () => {
        req.body.entryPoints = false

        await request(req.body).expect(409)
      })

      it('should respond with 409 if entryPoints is less than 3', async () => {
        req.body.entryPoints = 1

        await request(req.body).expect(409)
      })
    })
  })
})
