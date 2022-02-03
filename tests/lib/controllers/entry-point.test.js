'use strict'

const {
  MongoClient
} = require('mongodb')

const SlotsModel = require('@models/slots')
const LotsModel = require('@models/lots')
const EntryPointsModel = require('@models/entry-points')

const MongoHelper = require('@lib/helpers/mongodb')
const { NotFoundError } = require('@/lib/errors')

const Controller = require('@lib/controllers/entry-point')

const MongoDBTestHelper = require('@tests/test-files/mongodb-helper')

jest.mock('@models/entry-points')
jest.mock('@models/slots')
jest.mock('@models/lots')
jest.mock('@lib/helpers/mongodb')

describe('Entry point controller', () => {
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
      entryPointsModel: new EntryPointsModel(mongoClient, {
        database: 'test'
      }),
      lotsModel: new LotsModel(mongoClient, {
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

    it('should throw an error if entry points model is not provided', () => {
      expect(() => {
        return new Controller()
      }).toThrow()
    })

    it('should throw an error if slots model is not provided', () => {
      expect(() => {
        return new Controller({
          entryPointsModel: new EntryPointsModel(mongoClient, {
            databaseName: 'test'
          })
        })
      }).toThrow()
    })

    it('should throw an error if lots model is not provided', () => {
      expect(() => {
        return new Controller({
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
    let session

    beforeEach(() => {
      session = MongoDBTestHelper.getMockClientSession()

      MongoHelper.startSession
        .mockReturnValue(session)

      controller.entryPointsModel
        .create
        .mockResolvedValue({
          _id: 'entryPointId',
          name: '2'
        })

      controller.lotsModel
        .exists
        .mockResolvedValue(true)
    })

    it('should create an entry point and add it to existing slots', async () => {
      const entryPoint = await controller.create(lotId, '2')

      expect(entryPoint).toStrictEqual({
        id: 'entryPointId',
        name: '2'
      })

      expect(controller.lotsModel.exists).toHaveBeenCalledTimes(1)
      expect(controller.lotsModel.exists).toHaveBeenCalledWith(lotId)

      expect(MongoHelper.startSession).toHaveBeenCalledTimes(1)

      expect(controller.entryPointsModel.create).toHaveBeenCalledTimes(1)
      expect(controller.entryPointsModel.create).toHaveBeenCalledWith(
        lotId,
        {
          name: '2'
        },
        {
          session
        }
      )

      expect(controller.slotsModel.addNewEntryPoint).toHaveBeenCalledTimes(1)
      expect(controller.slotsModel.addNewEntryPoint).toHaveBeenCalledWith(
        lotId,
        'entryPointId',
        {
          session
        }
      )

      expect(session.endSession).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if the lot provided was not found', async () => {
      controller.lotsModel
        .exists
        .mockResolvedValue(false)

      await expect(
        controller.create(lotId, '2')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('#list', () => {
    beforeEach(() => {
      controller.entryPointsModel
        .list
        .mockResolvedValue([
          {
            _id: 'entryPointId1',
            name: '1'
          },
          {
            _id: 'entryPointId2',
            name: '2'
          }
        ])
    })

    it('should list all entry points of a lot', async () => {
      const entryPoints = await controller.list(lotId)

      expect(entryPoints).toStrictEqual([
        {
          id: 'entryPointId1',
          name: '1'
        },
        {
          id: 'entryPointId2',
          name: '2'
        }
      ])

      expect(controller.entryPointsModel.list).toHaveBeenCalledTimes(1)
      expect(controller.entryPointsModel.list).toHaveBeenCalledWith(lotId)
    })
  })
})
