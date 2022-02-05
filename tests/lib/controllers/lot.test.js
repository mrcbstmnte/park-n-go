'use strict'

const {
  MongoClient
} = require('mongodb')

const LotsModel = require('@models/lots')
const EntryPointsModel = require('@models/entry-points')

const MongoHelper = require('@lib/helpers/mongodb')

const Controller = require('@lib/controllers/lot')

const MongoDBTestHelper = require('@tests/test-files/mongodb-helper')

jest.mock('@models/lots')
jest.mock('@models/entry-points')
jest.mock('@lib/helpers/mongodb')

describe('Lot Controller', () => {
  /**
   * @type {Controller}
   */
  let controller

  /**
   * @type {MongoClient}
   */
  let mongoClient

  beforeAll(async () => {
    mongoClient = new MongoClient('mongodb://mongodb1:27401', {
      useUnifiedTopology: true,
      writeConcern: 'majority',
      ignoreUndefined: true
    })

    await mongoClient.connect()

    controller = new Controller({
      lotsModel: new LotsModel(mongoClient, {
        databaseName: 'test'
      }),
      entryPointsModel: new EntryPointsModel(mongoClient, {
        databaseName: 'test'
      })
    })
  })

  describe('@Constructor', () => {
    it('should have an instance of lots model', () => {
      expect(controller.lotsModel).toBeInstanceOf(LotsModel)
    })

    it('should have an instance of entry points model', () => {
      expect(controller.entryPointsModel).toBeInstanceOf(EntryPointsModel)
    })

    it('should throw an error if lots model is not provided', () => {
      expect(() => {
        return new Controller()
      }).toThrow()
    })

    it('should throw an error if entry points model is not provided', () => {
      expect(() => {
        return new Controller({
          lotsModel: new LotsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })
  })

  describe('#create', () => {
    let session

    beforeEach(() => {
      session = MongoDBTestHelper.getMockClientSession()

      MongoHelper.startSession
        .mockReturnValue(session)

      controller.lotsModel
        .create
        .mockResolvedValue({
          _id: 'lotId',
          name: 'park-lot'
        })
    })

    it('should create lot and appropriate entry points', async () => {
      const lot = await controller.create('park-lot', 3)

      expect(lot).toStrictEqual({
        id: 'lotId',
        name: 'park-lot'
      })

      expect(MongoHelper.startSession).toHaveBeenCalledTimes(1)

      expect(controller.lotsModel.create).toHaveBeenCalledTimes(1)
      expect(controller.lotsModel.create).toHaveBeenCalledWith({
        name: 'park-lot',
        entryPoints: 3
      }, {
        session
      })

      expect(controller.entryPointsModel.bulkCreate).toHaveBeenCalledTimes(1)
      expect(controller.entryPointsModel.bulkCreate).toHaveBeenCalledWith(
        'lotId',
        [
          {
            name: '1'
          },
          {
            name: '2'
          },
          {
            name: '3'
          }
        ],
        {
          session
        }
      )

      expect(session.endSession).toHaveBeenCalledTimes(1)
    })
  })

  describe('#list', () => {
    beforeEach(() => {
      controller.lotsModel
        .list
        .mockResolvedValue([
          {
            _id: 'parkId1',
            name: 'park1'
          },
          {
            _id: 'parkId2',
            name: 'park2'
          }
        ])
    })

    it('should list all parking lots', async () => {
      const lots = await controller.list()

      expect(lots).toStrictEqual([
        {
          id: 'parkId1',
          name: 'park1'
        },
        {
          id: 'parkId2',
          name: 'park2'
        }
      ])
    })
  })
})
