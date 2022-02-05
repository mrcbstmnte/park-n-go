'use strict'

const {
  MongoClient
} = require('mongodb')

const SlotsModel = require('@models/slots')
const LotsModel = require('@models/lots')
const EntryPointsModel = require('@models/entry-points')
const VehiclesModel = require('@models/vehicles')
const InvoicesModel = require('@models/invoices')

const { NotFoundError } = require('@/lib/errors')

const Controller = require('@lib/controllers/slot')

jest.mock('@models/slots')
jest.mock('@models/lots')
jest.mock('@models/vehicles')
jest.mock('@models/invoices')
jest.mock('@models/entry-points')

describe('Slot controller', () => {
  /**
   * @type {Controller}
   */
  let controller

  /**
    * @type {MongoClient}
    */
  let mongoClient

  const lotId = 'lotId'
  const slotId = 'slotId'

  beforeAll(async () => {
    mongoClient = new MongoClient('mongodb://localhost:27017', {
      useUnifiedTopology: true,
      writeConcern: 'majority',
      ignoreUndefined: true
    })

    await mongoClient.connect()

    controller = new Controller({
      slotsModel: new SlotsModel(mongoClient, {
        databaseName: 'test'
      }),
      lotsModel: new LotsModel(mongoClient, {
        databaseName: 'test'
      }),
      entryPointsModel: new EntryPointsModel(mongoClient, {
        databaseName: 'test'
      }),
      vehiclesModel: new VehiclesModel(mongoClient, {
        databaseName: 'test'
      }),
      invoicesModel: new InvoicesModel(mongoClient, {
        databaseName: 'test'
      })
    })
  })

  describe('@Constructor', () => {
    it('should have an instance of slots model', () => {
      expect(controller.slotsModel).toBeInstanceOf(SlotsModel)
    })

    it('should have an instance of lots model', () => {
      expect(controller.lotsModel).toBeInstanceOf(LotsModel)
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

    it('should throw an error if slots model is not provided', () => {
      expect(() => {
        return new Controller()
      }).toThrow()
    })

    it('should throw an error if lots model is not provided', () => {
      expect(() => {
        return new Controller({
          slotsModel: new SlotsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })

    it('should throw an error if entry points model is not provided', () => {
      expect(() => {
        return new Controller({
          slotsModel: new SlotsModel(mongoClient, {
            databaseName: 'test'
          }),
          lotsModel: new LotsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })

    it('should throw an error if vehicles model is not provided', () => {
      expect(() => {
        return new Controller({
          slotsModel: new SlotsModel(mongoClient, {
            databaseName: 'test'
          }),
          lotsModel: new LotsModel(mongoClient, {
            databaseName: 'test'
          }),
          entryPointsModel: new EntryPointsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })

    it('should throw an error if invoices model is not provided', () => {
      expect(() => {
        return new Controller({
          slotsModel: new SlotsModel(mongoClient, {
            databaseName: 'test'
          }),
          lotsModel: new LotsModel(mongoClient, {
            databaseName: 'test'
          }),
          entryPointsModel: new EntryPointsModel(mongoClient, {
            databaseName: 'test'
          }),
          vehiclesModel: new VehiclesModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })
  })

  describe('#create', () => {
    let slots

    beforeEach(() => {
      slots = [
        {
          type: 'small',
          distance: {
            1: 0,
            3: 1
          }
        },
        {
          type: 'medium',
          distance: {
            3: 0
          }
        }
      ]

      controller.slotsModel
        .bulkCreate
        .mockResolvedValue([
          {
            _id: 'slotId',
            name: 'AAA',
            type: 1
          }
        ])

      controller.lotsModel
        .exists
        .mockResolvedValue(true)

      controller.entryPointsModel
        .list
        .mockResolvedValue({
          1: 1,
          2: 1,
          3: 1
        })

      jest.spyOn(Controller, 'buildSlot')
    })

    it('should create slots for the parking lot', async () => {
      const createdSlots = await controller.create(lotId, slots)

      expect(createdSlots).toStrictEqual([
        {
          id: 'slotId',
          name: 'AAA',
          type: 'medium'
        }
      ])

      expect(controller.lotsModel.exists).toHaveBeenCalledTimes(1)
      expect(controller.lotsModel.exists).toHaveBeenCalledWith(lotId)

      expect(controller.entryPointsModel.list).toHaveBeenCalledTimes(1)
      expect(controller.entryPointsModel.list).toHaveBeenCalledWith(
        lotId,
        {
          accumulator: {},
          iterator: expect.any(Function)
        }
      )

      expect(controller.slotsModel.bulkCreate).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.bulkCreate).toHaveBeenCalledWith(
        lotId,
        [
          Controller.buildSlot.mock.results[0].value,
          Controller.buildSlot.mock.results[1].value
        ]
      )
    })

    it('should throw an error if the lot was not found', async () => {
      controller.lotsModel
        .exists
        .mockResolvedValue(false)

      await expect(
        controller.create(lotId, slots)
      ).rejects.toThrow(NotFoundError)

      expect(controller.lotsModel.exists).toHaveBeenCalledTimes(1)
      expect(controller.entryPointsModel.list).toHaveBeenCalledTimes(0)
      expect(controller.slotsModel.bulkCreate).toHaveBeenCalledTimes(0)
    })
  })

  describe('#buildSlot', () => {
    it('should build slot', () => {
      const built = Controller.buildSlot({
        1: 1,
        2: 1,
        3: 1
      }, {
        type: 'small',
        distance: {
          1: 0,
          2: 1
        }
      })

      expect(built).toStrictEqual({
        type: 'small',
        distance: {
          1: 0,
          2: 1,
          3: 1
        }
      })
    })
  })

  describe('#buildDistance', () => {
    it('should build the slot distance from the entry points', () => {
      const request = {
        1: 0,
        3: 1
      }
      const stored = {
        1: 1,
        2: 1,
        3: 1
      }

      expect(Controller.buildDistance(request, stored)).toStrictEqual({
        1: 0,
        2: 1,
        3: 1
      })
    })

    it('should remove unknown properties included in the request', () => {
      const request = {
        1: 0,
        3: 1,
        4: 1,
        6: 1
      }
      const stored = {
        1: 1,
        2: 1,
        3: 1
      }

      expect(Controller.buildDistance(request, stored)).toStrictEqual({
        1: 0,
        2: 1,
        3: 1
      })
    })
  })

  describe('#get', () => {
    beforeEach(() => {
      controller.slotsModel
        .getById
        .mockResolvedValue({
          _id: slotId,
          type: 2,
          distance: {}
        })

      controller.invoicesModel
        .getBySlot
        .mockResolvedValue({
          _id: 'invoiceId',
          vin: 'vin',
          rate: 40
        })

      controller.vehiclesModel
        .getByVin
        .mockResolvedValue({
          _id: 'vehicleId',
          vin: 'vin',
          type: 1
        })
    })

    it('should get the slot', async () => {
      const slot = await controller.get(slotId)

      expect(slot).toStrictEqual({
        id: 'slotId',
        type: 'large',
        distance: {},
        vehicle: {
          id: 'vehicleId',
          vin: 'vin',
          type: 'medium'
        },
        invoice: {
          id: 'invoiceId',
          rate: 40
        }
      })

      expect(controller.slotsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.getById).toHaveBeenCalledWith(slotId)

      expect(controller.invoicesModel.getBySlot).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.getBySlot).toHaveBeenCalledWith(slotId)

      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledWith('vin')
    })

    it('should return only the slot details if the invoice was not found', async () => {
      controller.invoicesModel
        .getBySlot
        .mockResolvedValue(null)

      const slot = await controller.get(slotId)

      expect(slot).toStrictEqual({
        id: 'slotId',
        type: 'large',
        distance: {}
      })

      expect(controller.slotsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.getBySlot).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledTimes(0)
    })

    it('should throw an error if the slot was not found', async () => {
      controller.slotsModel
        .getById
        .mockResolvedValue(null)

      await expect(
        controller.get(slotId)
      ).rejects.toThrow(NotFoundError)

      expect(controller.slotsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.getBySlot).toHaveBeenCalledTimes(0)
      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledTimes(0)
    })

    it('should throw an error if the vehicle was not found', async () => {
      controller.vehiclesModel
        .getByVin
        .mockResolvedValue(null)

      await expect(
        controller.get(slotId)
      ).rejects.toThrow(NotFoundError)

      expect(controller.slotsModel.getById).toHaveBeenCalledTimes(1)
      expect(controller.invoicesModel.getBySlot).toHaveBeenCalledTimes(1)
      expect(controller.vehiclesModel.getByVin).toHaveBeenCalledTimes(1)
    })
  })

  describe('#list', () => {
    beforeEach(() => {
      controller.lotsModel
        .exists
        .mockResolvedValue(true)

      controller.slotsModel
        .list
        .mockResolvedValue([
          {
            _id: 'slotId1',
            name: 'AA',
            type: 1
          },
          {
            _id: 'slotId2',
            name: 'BB',
            type: 2
          }
        ])
    })

    it('should list all slots of the parking lot', async () => {
      const slots = await controller.list(lotId)

      expect(slots).toStrictEqual([
        {
          id: 'slotId1',
          name: 'AA',
          type: 'medium'
        },
        {
          id: 'slotId2',
          name: 'BB',
          type: 'large'
        }
      ])

      expect(controller.lotsModel.exists).toHaveBeenCalledTimes(1)
      expect(controller.lotsModel.exists).toHaveBeenCalledWith(lotId)

      expect(controller.slotsModel.list).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.list).toHaveBeenCalledWith(lotId)
    })

    it('should throw an error if the parking lot was not found', async () => {
      controller.lotsModel
        .exists
        .mockResolvedValue(false)

      await expect(
        controller.list(lotId)
      ).rejects.toThrow(NotFoundError)

      expect(controller.lotsModel.exists).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.list).toHaveBeenCalledTimes(0)
    })
  })
})
