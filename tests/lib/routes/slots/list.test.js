'use strict'

const express = require('express')
const supertest = require('supertest')

const SlotController = require('@lib/controllers/slot')
const Route = require('@routes/slots/list')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/slot')

describe('Slot list route', () => {
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
        slot: new SlotController()
      }
    }

    route = new Route(router, context)
    route.setupRoutes()

    const app = createMockServer(route.router)

    request = (body) => supertest(app)
      .get('/slots')
      .send(body)
  })

  beforeEach(() => {
    req = {
      body: {
        lotId: 'lotId'
      }
    }

    route.controller
      .list
      .mockResolvedValue([
        {
          id: 'slotId1',
          type: 'small'
        },
        {
          id: 'slotId2',
          type: 'medium'
        }
      ])
  })

  describe('success', () => {
    it('should respond with 200 if slot listing was successful', async () => {
      const response = await request(req.body).expect(200)

      expect(response.body).toStrictEqual({
        ok: true,
        slots: [
          {
            id: 'slotId1',
            type: 'small'
          },
          {
            id: 'slotId2',
            type: 'medium'
          }
        ]
      })

      expect(route.controller.list).toHaveBeenCalledTimes(1)
      expect(route.controller.list).toHaveBeenCalledWith(
        'lotId'
      )
    })
  })

  describe('validation', () => {
    describe('lotId', () => {
      it('should respond with 409 if lotId is undefined', async () => {
        delete req.body.lotId

        await request(req.body).expect(409)
      })

      it('should respond with 409 if lotId is not a string', async () => {
        req.body.lotId = 123

        await request(req.body).expect(409)
      })

      it('should respond with 409 if lotId is an empty string', async () => {
        req.body.lotId = ''

        await request(req.body).expect(409)
      })
    })
  })
})
