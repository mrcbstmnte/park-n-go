'use strict'

const express = require('express')
const supertest = require('supertest')

const InvoiceController = require('@lib/controllers/invoice')
const Route = require('@routes/invoices/create')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/invoice')

describe('Invoice create route', () => {
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
        invoice: new InvoiceController()
      }
    }

    route = new Route(router, context)
    route.setupRoutes()

    const app = createMockServer(route.router)

    request = (body) => supertest(app)
      .post('/invoice')
      .send(body)
  })

  beforeEach(() => {
    req = {
      body: {
        entryPointId: 'entryPointId',
        vehicle: {
          type: 'small',
          vin: 'vin'
        }
      }
    }
  })

  describe('success', () => {
    it('should respond with 200 if invoice creation was successful', async () => {
      const response = await request(req.body).expect(200)

      expect(response.body).toStrictEqual({
        ok: true
      })

      expect(route.controller.create).toHaveBeenCalledTimes(1)
      expect(route.controller.create).toHaveBeenCalledWith(
        'entryPointId',
        {
          type: 'small',
          vin: 'vin'
        },
        {
          startDate: undefined
        }
      )
    })
  })

  describe('validation', () => {
    describe('entryPointId', () => {
      it('should respond with 409 if entryPointId is undefined', async () => {
        delete req.body.entryPointId

        await request(req.body).expect(409)
      })

      it('should respond with 409 if entryPointId is not a string', async () => {
        req.body.entryPointId = 123

        await request(req.body).expect(409)
      })

      it('should respond with 409 if entryPointId is an empty string', async () => {
        req.body.entryPointId = ''

        await request(req.body).expect(409)
      })
    })

    describe('vehicle', () => {
      it('should respond with 409 if vehicle is not defined', async () => {
        delete req.body.vehicle

        await request(req.body).expect(409)
      })

      it('should respond with 409 if vehicle is not an object', async () => {
        req.body.vehicle = 123

        await request(req.body).expect(409)
      })

      describe('type', () => {
        it('should respond with 409 if type is not defined', async () => {
          delete req.body.vehicle.type

          await request(req.body).expect(409)
        })

        it('should respond with 409 if type is invalid', async () => {
          req.body.vehicle.type = '123'

          await request(req.body).expect(409)
        })
      })

      describe('vin', () => {
        it('should respond with 409 if vin is not defined', async () => {
          delete req.body.vehicle.vin

          await request(req.body).expect(409)
        })

        it('should respond with 409 if vin is invalid', async () => {
          req.body.vehicle.vin = ''

          await request(req.body).expect(409)
        })
      })
    })

    describe('startDate', () => {
      it('should respond with 409 if startDate is not a valid date', async () => {
        req.body.startDate = '123'

        await request(req.body).expect(409)
      })
    })
  })
})
