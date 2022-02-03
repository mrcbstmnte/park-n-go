'use strict'

const path = require('path')

const LotsModel = require('@models/lots')
const SlotsModel = require('@models/slots')
const EntryPointsModel = require('@models/entry-points')
const VehiclesModel = require('@models/vehicles')
const InvoicesModel = require('@models/invoices')

const EntryPointController = require('@lib/controllers/entry-point')
const InvoiceController = require('@lib/controllers/invoice')
const LotController = require('@lib/controllers/lot')
const SlotController = require('@lib/controllers/slot')

const Service = require('@lib/service')
const router = require('@lib/router')
const { getConfig } = require('@tests/_utils')

const APP_ROOT = path.resolve(__dirname, '../../')

function noop () {}

jest.mock('@lib/router')

describe('Service', () => {
  /**
   * @type {Service}
   */
  let service

  const config = getConfig()

  beforeAll(() => {
    service = new Service(config)
  })

  describe('@Constructor', () => {
    it('should have an instance of models', () => {
      expect(service.models).toEqual({})
    })

    it('should have an instance of controllers', () => {
      expect(service.controllers).toEqual({})
    })
  })

  describe('#start', () => {
    beforeEach(() => {
      jest.spyOn(service, 'setupDependencies')
        .mockResolvedValue()

      jest.spyOn(service, 'setupServer')
        .mockReturnValue()
    })

    it('should start the service', async () => {
      await service.start()

      expect(service.setupDependencies).toHaveBeenCalledTimes(1)
      expect(service.setupServer).toHaveBeenCalledTimes(1)
    })
  })

  describe('#setupDependencies', () => {
    beforeEach(async () => {
      await service.setupDependencies()
    })

    it('should have an express instance', () => {
      expect(service.app).toBeDefined()
    })

    it('should have an express router instance', () => {
      expect(service.router).toBeDefined()
    })

    describe('models', () => {
      it('should have an instance of lots model', () => {
        expect(service.models.lots).toBeInstanceOf(LotsModel)
      })

      it('should have an instance of slots model', () => {
        expect(service.models.slots).toBeInstanceOf(SlotsModel)
      })

      it('should have an instance of entryPoints model', () => {
        expect(service.models.entryPoints).toBeInstanceOf(EntryPointsModel)
      })

      it('should have an instance of vehicles model', () => {
        expect(service.models.vehicles).toBeInstanceOf(VehiclesModel)
      })

      it('should have an instance of invoices model', () => {
        expect(service.models.invoices).toBeInstanceOf(InvoicesModel)
      })
    })

    describe('controllers', () => {
      it('should have an instance of entryPoint controller', () => {
        expect(service.controllers.entryPoint).toBeInstanceOf(EntryPointController)
      })

      it('should have an instance of invoice controller', () => {
        expect(service.controllers.invoice).toBeInstanceOf(InvoiceController)
      })

      it('should have an instance of lot controller', () => {
        expect(service.controllers.lot).toBeInstanceOf(LotController)
      })

      it('should have an instance of slot controller', () => {
        expect(service.controllers.slot).toBeInstanceOf(SlotController)
      })
    })
  })

  describe('#setupServer', () => {
    beforeEach(async () => {
      await service.setupDependencies()

      jest.spyOn(service, 'startListening')
        .mockImplementation(noop)
      jest.spyOn(service, 'setupRoutes')
        .mockImplementation(noop)
    })

    it('should setup the server', () => {
      service.setupServer()

      expect(service.startListening).toHaveBeenCalledTimes(1)
      expect(service.setupRoutes).toHaveBeenCalledTimes(1)
    })
  })

  describe('#getRoutePath', function () {
    it('should return absolute path to route folder', function () {
      expect(service.getRoutePath()).toEqual(`${APP_ROOT}/lib/routes`)
    })
  })

  describe('#setupRoutes', () => {
    beforeEach(async () => {
      await service.setupDependencies()

      jest.spyOn(service.app, 'use')
      jest.spyOn(service, 'getRoutePath')
        .mockReturnValue('./api')
    })

    it('should setup routes and use routers', () => {
      service.setupRoutes()

      expect(service.getRoutePath).toHaveBeenCalledTimes(1)

      expect(router.setup).toHaveBeenCalledTimes(1)
      expect(router.setup).toHaveBeenCalledWith(
        './api',
        service.router,
        service
      )

      expect(service.app.use).toHaveBeenCalledTimes(3)
      expect(service.app.use).toHaveBeenNthCalledWith(1, expect.any(Function))
      expect(service.app.use).toHaveBeenNthCalledWith(
        2,
        service.router
      )
      expect(service.app.use).toHaveBeenNthCalledWith(3, expect.any(Function))
    })
  })

  describe('#startListening', () => {
    beforeEach(async () => {
      await service.setupDependencies()

      jest.spyOn(service.app, 'listen')
        .mockImplementation(noop)
    })

    it('should listen to the http server', () => {
      service.startListening()

      expect(service.app.listen).toHaveBeenCalledTimes(1)
      expect(service.app.listen).toHaveBeenCalledWith(3004)
    })
  })
})
