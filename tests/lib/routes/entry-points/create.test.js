'use strict'

const express = require('express')
const supertest = require('supertest')

const EntryPointController = require('@lib/controllers/entry-point')
const Route = require('@routes/entry-points/create')

const { createMockServer } = require('@tests/_utils')

jest.mock('@lib/controllers/entry-point')

describe('Entry point create route', () => {
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
        entryPoint: new EntryPointController()
      }
    }

    route = new Route(router, context)
    route.setupRoutes()

    const app = createMockServer(route.router)

    request = (body) => supertest(app)
      .post('/entry-point')
      .send(body)
  })

  beforeEach(() => {
    req = {
      body: {
        lotId: 'lotId',
        name: 'EP 1'
      }
    }

    route.controller
      .create
      .mockResolvedValue({
        id: 'entryPointId'
      })
  })

  describe('success', () => {
    it('should respond with 200 if entry point creation was successful', async () => {
      const response = await request(req.body).expect(200)

      expect(response.body).toStrictEqual({
        ok: true,
        entryPoint: {
          id: 'entryPointId'
        }
      })

      expect(route.controller.create).toHaveBeenCalledTimes(1)
      expect(route.controller.create).toHaveBeenCalledWith(
        'lotId',
        'EP 1'
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
  })
})
