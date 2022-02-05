'use strict'

const express = require('express')
const supertest = require('supertest')

const SlotController = require('@lib/controllers/slot')
const Route = require('@routes/slots/create')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/slot')

describe('Slot create route', () => {
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
      .post('/slot')
      .send(body)
  })

  beforeEach(() => {
    req = {
      body: {
        lotId: 'lotId',
        slots: [
          {
            type: 'small',
            distance: {
              1: 1,
              2: 0
            }
          },
          {
            type: 'medium',
            distance: {
              1: 1,
              2: 0
            }
          }
        ]
      }
    }

    route.controller
      .create
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
    it('should respond with 200 if slot creation was successful', async () => {
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

      expect(route.controller.create).toHaveBeenCalledTimes(1)
      expect(route.controller.create).toHaveBeenCalledWith(
        'lotId',
        [
          {
            type: 'small',
            distance: {
              1: 1,
              2: 0
            }
          },
          {
            type: 'medium',
            distance: {
              1: 1,
              2: 0
            }
          }
        ]
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

    describe('slots', () => {
      it('should respond with 409 if slots is undefined', async () => {
        delete req.body.slots

        await request(req.body).expect(409)
      })

      it('should respond with 409 if slots is not an array', async () => {
        req.body.slots = 123

        await request(req.body).expect(409)
      })

      it('should respond with 409 if slots is an empty array', async () => {
        req.body.slots = []

        await request(req.body).expect(409)
      })

      describe('type', () => {
        it('should respond with 409 if type is undefined', async () => {
          delete req.body.slots[0].type

          await request(req.body).expect(409)
        })

        it('should respond with 409 if type is invalid', async () => {
          req.body.slots[0].type = 'haha'

          await request(req.body).expect(409)
        })
      })

      describe('distance', () => {
        it('should respond with 409 if distance is undefined', async () => {
          delete req.body.slots[0].distance

          await request(req.body).expect(409)
        })

        it('should respond with 409 if distance is not an object', async () => {
          req.body.slots[0].type = 'haha'

          await request(req.body).expect(409)
        })
      })
    })
  })
})
