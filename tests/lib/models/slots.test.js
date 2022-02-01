'use strict'

const {
  MongoClient,
  ObjectId
} = require('mongodb')

const Model = require('@models/slots')

describe('Slots Model', () => {
  /**
   * @type {Model}
   */
  let model
  let collection

  const lotId = '407f191e810c19729de860ff'

  const slotId = '5e24763552e7fadad71de15b'
  const nearestSlotId = '5fff191e810c19729de83d45'

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

    await model.setupCollection()
  })

  beforeEach(async () => {
    await collection.deleteMany()
  })

  describe('#bulkCreate', () => {
    it('should create slots', async () => {
      const slots = await model.bulkCreate(lotId, [
        {
          type: 'small',
          distance: {
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0,
            '5e24763552e7fadad71de154': 0
          }
        },
        {
          type: 'medium',
          distance: {
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1,
            '5e24763552e7fadad71de154': 0
          }
        }
      ])

      expect(slots).toStrictEqual([
        {
          _id: expect.any(ObjectId),
          label: expect.any(String),
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0
          },
          occupied: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          _id: expect.any(ObjectId),
          label: expect.any(String),
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })
  })

  describe('#findNearest', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(slotId),
          label: 'WKVNHJ',
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(nearestSlotId),
          label: '1LPYHT',
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          label: 'MTHG6T',
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should find the nearest available slot to the given entry point', async () => {
      const slot = await model.findNearest(lotId, {
        entryPointId: '5e24763552e7fadad71de15b',
        type: 'small'
      })

      expect(slot._id.toString()).toStrictEqual(nearestSlotId)
    })

    it('should return `null` when no available slots was found', async () => {
      const slot = await model.findNearest(lotId, {
        entryPointId: '5e24763552e7fadad71de15b',
        type: 'large'
      })

      expect(slot).toBeNull()
    })
  })

  describe('#list', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(slotId),
          label: 'WKVNHJ',
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(nearestSlotId),
          label: '1LPYHT',
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          label: 'MTHG6T',
          lotId: new ObjectId(),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should list all slots of given lot Id', async () => {
      const slots = await model.list(lotId)

      expect(slots).toStrictEqual([
        {
          _id: expect.any(ObjectId),
          label: expect.any(String),
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0
          },
          occupied: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          _id: expect.any(ObjectId),
          label: expect.any(String),
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })
  })

  describe('#addNewEntryPoints', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(slotId),
          label: 'WKVNHJ',
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(nearestSlotId),
          label: '1LPYHT',
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          label: 'MTHG6T',
          lotId: new ObjectId(),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should add new entry points to the distance property', async () => {
      await model.addNewEntryPoints(lotId, '5e24763552e7fadad71de15e')

      const slots = await model.collection.find({
        lotId: new ObjectId(lotId)
      }).toArray()

      expect(slots).toStrictEqual([
        {
          _id: expect.any(ObjectId),
          label: expect.any(String),
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0,
            '5e24763552e7fadad71de15e': 1
          },
          occupied: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          _id: expect.any(ObjectId),
          label: expect.any(String),
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1,
            '5e24763552e7fadad71de15e': 1
          },
          occupied: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })
  })

  describe('#updateOccupancy', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(slotId),
          label: 'WKVNHJ',
          lotId: new ObjectId(lotId),
          type: 0,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 1,
            '5e24763552e7fadad71de15c': 0
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(nearestSlotId),
          label: '1LPYHT',
          lotId: new ObjectId(lotId),
          type: 1,
          distance: {
            '5e24763552e7fadad71de154': 0,
            '5e24763552e7fadad71de15b': 0,
            '5e24763552e7fadad71de15c': 1
          },
          occupied: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should update the slot of given Id', async () => {
      await model.updateOccupancy(slotId, {
        occupied: true
      })

      const slot = await model.collection.findOne({
        _id: new ObjectId(slotId)
      })

      expect(slot.occupied).toBeTruthy()
    })
  })
})
