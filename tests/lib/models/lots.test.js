'use strict'

const {
  MongoClient,
  ObjectId
} = require('mongodb')

const Model = require('@models/lots')

describe('Lots Model', () => {
  /**
   * @type {Model}
   */
  let model
  let collection

  const lotId = '5e24763552e7fadad71de15b'
  const anotherLotId = '5fff191e810c19729de83d45'

  beforeAll(async () => {
    const mongoClient = new MongoClient('mongodb://localhost:27017', {
      useUnifiedTopology: true,
      writeConcern: 'majority',
      ignoreUndefined: true
    })

    await mongoClient.connect()

    model = new Model(mongoClient, {
      databaseName: 'test'
    })

    collection = model.collection
  })

  beforeEach(async () => {
    await collection.deleteMany()
  })

  describe('#create', () => {
    it('should create a new lot', async () => {
      const lot = await model.create({
        name: 'Lot A',
        entryPoints: 4
      })

      expect(lot).toStrictEqual({
        _id: expect.any(ObjectId),
        name: 'Lot A',
        entryPoints: 4,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('#list', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(lotId),
          name: 'Lot A',
          entryPoints: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherLotId),
          name: 'Lot B',
          entryPoints: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should list all parking lots', async () => {
      const lots = await model.list()

      expect(lots).toStrictEqual([
        {
          _id: new ObjectId(lotId),
          name: 'Lot A',
          entryPoints: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          _id: new ObjectId(anotherLotId),
          name: 'Lot B',
          entryPoints: 4,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })
  })

  describe('#exists', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(lotId),
          name: 'Lot A',
          entryPoints: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherLotId),
          name: 'Lot B',
          entryPoints: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should check if the parking lot exists', async () => {
      let exists = await model.exists(lotId)

      expect(exists).toBeTruthy()

      exists = await model.exists(new ObjectId())

      expect(exists).toBeFalsy()
    })
  })

  describe('#delete', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(lotId),
          name: 'Lot A',
          entryPoints: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherLotId),
          name: 'Lot B',
          entryPoints: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should delete a lot', async () => {
      await model.delete(anotherLotId)

      const lot = await model.collection.findOne({
        _id: new ObjectId(anotherLotId)
      })

      expect(lot).toBeNull()
    })
  })
})
