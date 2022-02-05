'use strict'

const {
  MongoClient,
  ObjectId
} = require('mongodb')

const Model = require('@models/entry-points')
const { expect } = require('@jest/globals')
const { DuplicateKeyError } = require('@/lib/errors')

describe('Entry Points Model', () => {
  /**
   * @type {Model}
   */
  let model
  let collection

  const lotId = '407f191e810c19729de860ff'

  const entryPointId = '5e24763552e7fadad71de15b'
  const anotherEntryPointId = '5fff191e810c19729de83d45'

  beforeAll(async () => {
    const mongoClient = new MongoClient('mongodb://mongodb1:27401', {
      useUnifiedTopology: true,
      writeConcern: 'majority',
      ignoreUndefined: true
    })

    await mongoClient.connect()

    model = new Model(mongoClient, {
      databaseName: 'test'
    })

    collection = model.collection

    await model.setupCollection()
  })

  beforeEach(async () => {
    await collection.deleteMany()
  })

  describe('#create', () => {
    it('should create a new entry point', async () => {
      const entryPoint = await model.create(lotId, {
        name: 'entry A'
      })

      expect(entryPoint).toStrictEqual({
        _id: expect.any(ObjectId),
        lotId: new ObjectId(lotId),
        name: 'entry A',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should throw an error if an entry point with the same name already exist', async () => {
      await model.create(lotId, {
        name: 'entry A'
      })

      await expect(
        model.create(lotId, {
          name: 'entry A'
        })
      ).rejects.toThrow(DuplicateKeyError)
    })
  })

  describe('#bulkCreate', () => {
    it('should create bulk entry points', async () => {
      const createdEntryPoints = await model.bulkCreate(lotId, [
        {
          name: 'A'
        },
        {
          name: 'B'
        }
      ])

      expect(createdEntryPoints).toStrictEqual([
        {
          _id: expect.any(ObjectId),
          lotId: new ObjectId('407f191e810c19729de860ff'),
          name: 'A',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          _id: expect.any(ObjectId),
          lotId: new ObjectId('407f191e810c19729de860ff'),
          name: 'B',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })

    it('should throw an error if any name for the entry point already exist', async () => {
      await model.bulkCreate(lotId, [
        {
          name: 'A'
        },
        {
          name: 'B'
        }
      ])

      await expect(
        model.bulkCreate(lotId, [
          {
            name: 'C'
          },
          {
            name: 'B'
          }
        ])
      ).rejects.toThrow(DuplicateKeyError)
    })
  })

  describe('#getById', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(entryPointId),
          lotId: new ObjectId(lotId),
          name: 'entry A',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherEntryPointId),
          lotId: new ObjectId(lotId),
          name: 'entry B',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should get the entry point of given lot', async () => {
      const entryPoint = await model.getById(entryPointId)

      expect(entryPoint).toStrictEqual({
        _id: new ObjectId(entryPointId),
        lotId: new ObjectId(lotId),
        name: 'entry A',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should return `null` if the entry point was not found', async () => {
      const entryPoint = await model.getById(new ObjectId().toString())

      expect(entryPoint).toBeNull()
    })
  })

  describe('#list', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(entryPointId),
          lotId: new ObjectId(lotId),
          name: 'entry A',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherEntryPointId),
          lotId: new ObjectId(lotId),
          name: 'entry B',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          lotId: new ObjectId(),
          name: 'entry D',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should list all entry points for a given lot', async () => {
      const entryPoints = await model.list(lotId)

      expect(entryPoints).toStrictEqual([
        {
          _id: new ObjectId(entryPointId),
          lotId: new ObjectId(lotId),
          name: 'entry A',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          _id: new ObjectId(anotherEntryPointId),
          lotId: new ObjectId(lotId),
          name: 'entry B',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })

    it('should apply the iterator provided', async () => {
      const entryPoints = await model.list(lotId, {
        accumulator: {},
        iterator: function (accumulator, document) {
          accumulator[document._id.toString()] = 1
        }
      })

      expect(entryPoints).toStrictEqual({
        [entryPointId]: 1,
        [anotherEntryPointId]: 1
      })
    })
  })

  describe('#exists', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(entryPointId),
          name: 'entry A',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherEntryPointId),
          name: 'entry B',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should check if the parking entry point exists', async () => {
      let exists = await model.exists(entryPointId)

      expect(exists).toBeTruthy()

      exists = await model.exists(new ObjectId())

      expect(exists).toBeFalsy()
    })
  })

  describe('#delete', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(entryPointId),
          name: 'entry A',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherEntryPointId),
          name: 'entry B',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should delete an entry point', async () => {
      await model.delete(anotherEntryPointId)

      const entryPoint = await model.collection.findOne({
        _id: new ObjectId(anotherEntryPointId)
      })

      expect(entryPoint).toBeNull()
    })
  })
})
