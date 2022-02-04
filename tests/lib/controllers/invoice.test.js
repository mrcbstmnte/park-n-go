'use strict'

const {
  MongoClient
} = require('mongodb')

const SlotsModel = require('@models/slots')
const InvoicesModel = require('@models/invoices')
const EntryPointsModel = require('@models/entry-points')
const VehiclesModel = require('@models/vehicles')

const MongoHelper = require('@lib/helpers/mongodb')
const { NotFoundError, BusinessLogicError } = require('@/lib/errors')

const Controller = require('@lib/controllers/invoice')

const MongoDBTestHelper = require('@tests/test-files/mongodb-helper')

jest.mock('@models/entry-points')
jest.mock('@models/slots')
jest.mock('@models/vehicles')
jest.mock('@models/invoices')
jest.mock('@lib/helpers/mongodb')

describe('Invoice controller', () => {
  /**
   * @type {Controller}
   */
  let controller

  /**
    * @type {MongoClient}
    */
  let mongoClient

  const vin = 'AAA-656'
  const lotId = 'lotId'
  const entryPointId = 'entryPointId'
  const slotId = 'slotId'
  const invoiceId = 'invoiceId'

  beforeAll(async () => {
    mongoClient = new MongoClient('mongodb://localhost:27017', {
      useUnifiedTopology: true,
      writeConcern: 'majority',
      ignoreUndefined: true
    })

    await mongoClient.connect()

    controller = new Controller({
      slotsModel: new SlotsModel(mongoClient, {
        database: 'test'
      }),
      entryPointsModel: new EntryPointsModel(mongoClient, {
        database: 'test'
      }),
      invoicesModel: new InvoicesModel(mongoClient, {
        database: 'test'
      }),
      vehiclesModel: new VehiclesModel(mongoClient, {
        database: 'test'
      })
    })
  })

  describe('@Constructor', () => {
    it('should have an instance of slots model', () => {
      expect(controller.slotsModel).toBeInstanceOf(SlotsModel)
    })

    it('should have an instance of entry points model', () => {
      expect(controller.entryPointsModel).toBeInstanceOf(EntryPointsModel)
    })

    it('should have an instance of vehicles model', () => {
      expect(controller.vehiclesModel).toBeInstanceOf(VehiclesModel)
    })

    it('should have an instance of invoices model', () => {
      expect(controller.invoicesModel).toBeInstanceOf(InvoicesModel)
    })

    it('should throw an error if invoices model is not provided', () => {
      expect(() => {
        return new Controller()
      }).toThrow()
    })

    it('should throw an error if slots model is not provided', () => {
      expect(() => {
        return new Controller({
          invoicesModel: new InvoicesModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })

    it('should throw an error if entry points model is not provided', () => {
      expect(() => {
        return new Controller({
          invoicesModel: new InvoicesModel(mongoClient, {
            databaseName: 'test'
          }),
          slotsModel: new SlotsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })

    it('should throw an error if vehicles model is not provided', () => {
      expect(() => {
        return new Controller({
          invoicesModel: new InvoicesModel(mongoClient, {
            databaseName: 'test'
          }),
          entryPointsModel: new EntryPointsModel(mongoClient, {
            databaseName: 'test'
          }),
          slotsModel: new SlotsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })
  })

  describe('#create', () => {
    let session, vehicle
    let vehicleCreated

    beforeEach(() => {
      vehicle = {
        type: 'small',
        vin
      }

      const lastVisitDate = new Date()
      lastVisitDate.setHours(lastVisitDate.getHours() - 2)

      vehicleCreated = {
        _id: 'vehicleId',
        type: 'small',
        vin,
        lastVisit: {
          duration: 5,
          date: lastVisitDate
        }
      }

      session = MongoDBTestHelper.getMockClientSession()

      MongoHelper.startSession
        .mockReturnValue(session)

      controller.entryPointsModel
        .getById
        .mockResolvedValue({
          _id: entryPointId,
          lotId
        })

      controller.vehiclesModel
        .create
        .mockResolvedValue(vehicleCreated)

      controller.slotsModel
        .findNearest
        .mockResolvedValue({
          _id: slotId,
          type: 1
        })
    })

    it('should create an invoice for the vehicle', async () => {
      await controller.create(entryPointId, vehicle)

      expect(controller.entryPointsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.entryPointsModel.getById).toHaveBeenCalledWith(entryPointId)

      expect(controller.slotsModel.findNearest).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.findNearest).toHaveBeenCalledWith(
        lotId,
        {
          type: 'small',
          entryPointId
        }
      )

      expect(MongoHelper.startSession).toHaveBeenCalledTimes(1)

      expect(controller.vehiclesModel.create).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.create).toHaveBeenCalledWith(
        vehicle,
        {
          session
        }
      )

      expect(controller.invoicesModel.create).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.create).toHaveBeenCalledWith(
        slotId,
        {
          vin,
          rate: 60,
          isContinuous: false
        },
        {
          session
        }
      )

      expect(controller.slotsModel.updateOccupancy).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.updateOccupancy).toHaveBeenCalledWith(
        slotId,
        {
          occupied: true
        },
        {
          session
        }
      )

      expect(session.endSession).toHaveBeenCalledTimes(1)
    })

    it('should create an invoice with continuous rate', async () => {
      const now = new Date()
      now.setMinutes(now.getMinutes() - 30)
      vehicleCreated.lastVisit.date = now

      await controller.create(entryPointId, vehicle)

      expect(controller.invoicesModel.create).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.create).toHaveBeenCalledWith(
        slotId,
        {
          vin,
          rate: 60,
          isContinuous: true
        },
        {
          session
        }
      )
    })

    it('should create an invoice with custom start date', async () => {
      vehicleCreated.lastVisit.date = new Date('2022-02-02 09:00:00.00000')

      await controller.create(entryPointId, vehicle, {
        startDate: new Date('2022-02-02 11:00:00.00000')
      })

      expect(controller.invoicesModel.create).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.create).toHaveBeenCalledWith(
        slotId,
        {
          vin,
          rate: 60,
          isContinuous: false
        },
        {
          session
        }
      )
    })

    it('should throw an error if there are not available slots', async () => {
      controller.slotsModel
        .findNearest
        .mockResolvedValue(null)

      await expect(
        controller.create(entryPointId, vehicle)
      ).rejects.toThrow(BusinessLogicError)

      expect(controller.entryPointsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.findNearest).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.create).toHaveBeenCalledTimes(0)
      expect(controller.invoicesModel.create).toHaveBeenCalledTimes(0)
      expect(controller.slotsModel.updateOccupancy).toHaveBeenCalledTimes(0)
    })

    it('should throw an error if the entry point was not found', async () => {
      controller.entryPointsModel
        .getById
        .mockResolvedValue(null)

      await expect(
        controller.create(entryPointId, vehicle)
      ).rejects.toThrow(NotFoundError)

      expect(controller.entryPointsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.findNearest).toHaveBeenCalledTimes(0)
      expect(controller.vehiclesModel.create).toHaveBeenCalledTimes(0)
      expect(controller.invoicesModel.create).toHaveBeenCalledTimes(0)
      expect(controller.slotsModel.updateOccupancy).toHaveBeenCalledTimes(0)
    })
  })

  describe('#settle', () => {
    let invoice, settledInvoice
    let vehicle

    let session

    let startDate
    const endDate = new Date()

    beforeEach(() => {
      startDate = new Date()
      startDate.setHours(startDate.getHours() - 5)

      invoice = {
        _id: invoiceId,
        isContinuous: false,
        hourlyRate: 40,
        settled: false,
        vin,
        slotId,
        createdAt: startDate
      }
      settledInvoice = {
        isContinuous: false,
        hourlyRate: 40,
        settled: true,
        vin
      }
      vehicle = {
        lastVisit: {}
      }

      session = MongoDBTestHelper.getMockClientSession()

      MongoHelper.startSession
        .mockReturnValue(session)

      controller.invoicesModel
        .getById
        .mockResolvedValue(invoice)

      controller.invoicesModel
        .settle
        .mockResolvedValue(settledInvoice)

      controller.vehiclesModel
        .getByVin
        .mockResolvedValue(vehicle)
    })

    it('should settle the invoice for the vehicle', async () => {
      const startDate = new Date()
      startDate.setHours(startDate.getHours() - 5)

      invoice.createdAt = startDate

      await controller.settle(invoiceId)

      expect(controller.invoicesModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.getById).toHaveBeenCalledWith(invoiceId)

      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledWith(vin)

      expect(MongoHelper.startSession).toHaveBeenCalledTimes(1)

      expect(controller.slotsModel.updateOccupancy).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.updateOccupancy).toHaveBeenCalledWith(
        slotId,
        {
          occupied: false
        },
        {
          session
        }
      )

      expect(controller.vehiclesModel.updateLastVisit).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.updateLastVisit).toHaveBeenCalledWith(
        vin,
        {
          date: expect.any(Date),
          duration: 5
        },
        {
          session
        }
      )

      expect(controller.invoicesModel.settle).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.settle).toHaveBeenCalledWith(
        invoiceId,
        120,
        {
          session
        }
      )

      expect(session.endSession).toHaveBeenCalledTimes(1)
    })

    it('should settle and compute payment that has advance end date', async () => {
      invoice.createdAt = new Date()
      endDate.setDate(endDate.getDate() + 1)

      await controller.settle(invoiceId, {
        endDate
      })

      expect(controller.vehiclesModel.updateLastVisit).toHaveBeenCalledWith(
        vin,
        {
          date: endDate,
          duration: 24
        },
        {
          session
        }
      )

      expect(controller.invoicesModel.settle).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.settle).toHaveBeenCalledWith(
        invoiceId,
        5000,
        {
          session
        }
      )
    })

    it('should compute continuos rate and carry over previous duration', async () => {
      const startDate = new Date()
      startDate.setHours(startDate.getHours() - 5)

      vehicle.lastVisit.duration = 3
      invoice.isContinuous = true
      invoice.createdAt = startDate

      await controller.settle(invoiceId)

      expect(controller.vehiclesModel.updateLastVisit).toHaveBeenCalledWith(
        vin,
        {
          date: expect.any(Date),
          duration: 8
        },
        {
          session
        }
      )

      expect(controller.invoicesModel.settle).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.settle).toHaveBeenCalledWith(
        invoiceId,
        200,
        {
          session
        }
      )
    })

    it('should throw an error if the invoice was not found', async () => {
      controller.invoicesModel
        .getById
        .mockResolvedValue(null)

      await expect(
        controller.settle(invoiceId)
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw an error if the vehicle was not found', async () => {
      controller.vehiclesModel
        .getByVin
        .mockResolvedValue(null)

      await expect(
        controller.settle(invoiceId)
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw an error if the invoice was already settled', async () => {
      invoice.settled = true

      await expect(
        controller.settle(invoiceId)
      ).rejects.toThrow(BusinessLogicError)
    })

    it('should throw an error if the end date is earlier than start/created date', async () => {
      const now = new Date()
      const endDate = new Date()
      endDate.setHours(endDate.getHours() - 2)
      invoice.createdAt = now

      await expect(
        controller.settle(invoiceId, {
          endDate: endDate
        })
      ).rejects.toThrow(BusinessLogicError)
    })
  })

  describe('#computeFlatRate', () => {
    it('should return the flat rate if the vehicle has been away for more than 1 hour', () => {
      const flatRate = Controller.computeFlatRate(false)

      expect(flatRate).toEqual(40)
    })

    it('should return the flat rate to be 0 if the vehicle has been away for less than an hour', () => {
      const flatRate = Controller.computeFlatRate(true)

      expect(flatRate).toEqual(0)
    })
  })

  describe('#computePayment', () => {
    let ticket

    beforeEach(() => {
      ticket = {
        hourlyRate: 40
      }
    })

    it('should compute the payment', () => {
      const payment = Controller.computePayment(ticket, 40, 4)

      expect(payment).toEqual(80)
    })

    it('should compute the payment with the given end date', () => {
      const payment = Controller.computePayment(ticket, 40, 3)

      expect(payment).toEqual(40)
    })
  })

  describe('#computeTimeDiff', () => {
    it('should compute the time difference in hours', () => {
      const start = new Date('2022-02-02 09:00:00.00000')
      const end = new Date('2022-02-02 11:30:00.00000')

      const diff = Controller.computeTimeDiff(start, end)

      expect(diff).toEqual(3)
    })

    it('should compute time difference in minutes', () => {
      const start = new Date('2022-02-02 09:00:00.00000')
      const end = new Date('2022-02-02 11:30:00.00000')

      const diff = Controller.computeTimeDiff(start, end, {
        divisor: 1000 * 60
      })

      expect(diff).toEqual(150)
    })

    it('should compute the difference with the given rounding mechanism', () => {
      const start = new Date('2022-02-02 09:00:00.00000')
      const end = new Date('2022-02-02 11:30:00.00000')

      const diff = Controller.computeTimeDiff(start, end, {
        mechanism: Math.floor
      })

      expect(diff).toEqual(2)
    })
  })
})
