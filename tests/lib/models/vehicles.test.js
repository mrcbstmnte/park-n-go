'use strict'

const {
  MongoClient,
  ObjectId
} = require('mongodb')

const Model = require('@models/vehicles')

describe('Vehicles Model', () => {
  /**
   * @type {Model}
   */
  let model
  let collection

  const vehicleId = '5e24763552e7fadad71de15b'
  const anotherVehicleId = '5fff191e810c19729de83d45'

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

  describe('#create', () => {
    it('should create a new vehicle', async () => {
      const vehicle = await model.create({
        vin: 'AAA',
        type: 0
      })

      expect(vehicle).toStrictEqual({
        _id: expect.any(ObjectId),
        vin: 'AAA',
        type: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should update if the vehicle was already registered', async () => {
      const created = await model.create({
        vin: 'AAA',
        type: 0
      })

      const updated = await model.create({
        vin: 'AAA',
        type: 0
      })

      expect(updated.createdAt.valueOf()).toBeGreaterThan(created.updatedAt.valueOf())
    })
  })

  describe('#getByVin', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(vehicleId),
          vin: 'AAB',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherVehicleId),
          vin: 'AAA',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should get the vehicle of given Id', async () => {
      const vehicle = await model.getByVin('AAB')

      expect(vehicle).toStrictEqual({
        _id: new ObjectId(vehicleId),
        vin: 'AAB',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should return `null` if the vehicle was not found', async () => {
      const vehicle = await model.getByVin('DDD')

      expect(vehicle).toBeNull()
    })
  })

  describe('#updateLastVisit', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(vehicleId),
          vin: 'AAB',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(anotherVehicleId),
          vin: 'AAA',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should update the vehicle with the current time', async () => {
      const vehicle = await model.getByVin('AAB')

      const updated = await model.updateLastVisit('AAB')

      expect(updated.updatedAt.valueOf()).toBeGreaterThan(vehicle.updatedAt.valueOf())
    })

    it('should update an existing vehicle with a predefined date', async () => {
      const lastVisitDate = new Date('2022-12-12')

      const updated = await model.updateLastVisit('AAB', {
        endDate: lastVisitDate
      })

      expect(updated.updatedAt).toStrictEqual(lastVisitDate)
    })
  })
})
