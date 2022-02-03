'use strict'

const {
  MongoClient
} = require('mongodb')

const SlotsModel = require('@models/slots')
const LotsModel = require('@models/lots')
const EntryPointsModel = require('@models/entry-points')

const { NotFoundError } = require('@/lib/errors')

const Controller = require('@lib/controllers/slot')

jest.mock('@models/slots')
jest.mock('@models/lots')
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
      lotsModel: new LotsModel(mongoClient, {
        database: 'test'
      }),
      entryPointsModel: new EntryPointsModel(mongoClient, {
        database: 'test'
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
        .mockResolvedValue()

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
      await controller.create(lotId, slots)

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
            name: 'AA'
          },
          {
            _id: 'slotId2',
            name: 'BB'
          }
        ])
    })

    it('should list all slots of the parking lot', async () => {
      const slots = await controller.list(lotId)

      expect(slots).toStrictEqual([
        {
          id: 'slotId1',
          name: 'AA'
        },
        {
          id: 'slotId2',
          name: 'BB'
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
