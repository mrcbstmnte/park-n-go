'use strict'

const express = require('express')
const supertest = require('supertest')

const InvoiceController = require('@lib/controllers/invoice')
const Route = require('@routes/invoices/settle')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/invoice')

describe('Invoice settle route', () => {
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
      .post('/settle')
      .send(body)
  })

  beforeEach(() => {
    req = {
      body: {
        invoiceId: 'invoiceId'
      }
    }

    route.controller
      .settle
      .mockResolvedValue({
        id: 'invoiceId',
        amount: 500
      })
  })

  describe('success', () => {
    it('should respond with 200 if invoice creation was successful', async () => {
      const response = await request(req.body).expect(200)

      expect(response.body).toStrictEqual({
        ok: true,
        invoice: {
          id: 'invoiceId',
          amount: 500
        }
      })

      expect(route.controller.settle).toHaveBeenCalledTimes(1)
      expect(route.controller.settle).toHaveBeenCalledWith(
        'invoiceId',
        {
          endDate: undefined
        }
      )
    })
  })

  describe('validation', () => {
    describe('invoiceId', () => {
      it('should respond with 409 if invoiceId is undefined', async () => {
        delete req.body.invoiceId

        await request(req.body).expect(409)
      })

      it('should respond with 409 if invoiceId is not a string', async () => {
        req.body.invoiceId = 123

        await request(req.body).expect(409)
      })

      it('should respond with 409 if invoiceId is an empty string', async () => {
        req.body.invoiceId = ''

        await request(req.body).expect(409)
      })
    })

    describe('endDate', () => {
      it('should respond with 409 if endDate is not a valid date', async () => {
        req.body.endDate = '123'

        await request(req.body).expect(409)
      })
    })
  })
})
