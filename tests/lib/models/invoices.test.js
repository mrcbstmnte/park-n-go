'use strict'

const {
  MongoClient,
  ObjectId
} = require('mongodb')

const Model = require('@models/invoices')

describe('Invoices Model', () => {
  /**
   * @type {Model}
   */
  let model
  let collection

  const invoiceId = '5e24763552e7fadad71de15c'

  const slotId = '5e24763552e7fadad71de15b'
  const vin = 'AABB'

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
  })

  beforeEach(async () => {
    await collection.deleteMany()
  })

  describe('#create', () => {
    it('should create an invoice', async () => {
      const invoice = await model.create(slotId, {
        vin,
        rate: 40
      })

      expect(invoice).toStrictEqual({
        _id: expect.any(ObjectId),
        slotId: new ObjectId(slotId),
        vin,
        amount: 0,
        isContinuous: false,
        settled: false,
        hourlyRate: 40,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should create an invoice setting `isContinuous` to true', async () => {
      const invoice = await model.create(slotId, {
        vin,
        rate: 40,
        isContinuous: true
      })

      expect(invoice).toStrictEqual({
        _id: expect.any(ObjectId),
        slotId: new ObjectId(slotId),
        vin,
        amount: 0,
        isContinuous: true,
        settled: false,
        hourlyRate: 40,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('#getById', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(invoiceId),
          vin,
          amount: 0,
          settled: false,
          hourlyRate: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          vin: 'CCB',
          amount: 4,
          settled: true,
          hourlyRate: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should get the invoice by Id', async () => {
      const invoice = await model.getById(invoiceId)

      expect(invoice).toStrictEqual({
        _id: new ObjectId(invoiceId),
        vin,
        amount: 0,
        settled: false,
        hourlyRate: 40,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('#getBySlot', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(invoiceId),
          slotId: new ObjectId(slotId),
          vin,
          amount: 0,
          settled: false,
          hourlyRate: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          slotId: new ObjectId(slotId),
          vin: 'CCB',
          amount: 4,
          settled: true,
          hourlyRate: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should get the invoice by given slot Id', async () => {
      const invoice = await model.getBySlot(slotId)

      expect(invoice).toStrictEqual({
        _id: new ObjectId(invoiceId),
        slotId: new ObjectId(slotId),
        vin,
        amount: 0,
        settled: false,
        hourlyRate: 40,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should get the invoice by given slot Id with given query', async () => {
      const invoice = await model.getBySlot(slotId, {
        settled: true
      })

      expect(invoice).toStrictEqual({
        _id: expect.any(ObjectId),
        slotId: new ObjectId(slotId),
        vin: 'CCB',
        amount: 4,
        settled: true,
        hourlyRate: 40,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('#settle', () => {
    beforeEach(async () => {
      await collection.insertMany([
        {
          _id: new ObjectId(invoiceId),
          vin,
          amount: 0,
          settled: false,
          hourlyRate: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          vin: 'CCB',
          amount: 4,
          settled: true,
          hourlyRate: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })

    it('should settle the invoice', async () => {
      const invoice = await model.settle(invoiceId, 400)

      expect(invoice.amount).toEqual(400)
      expect(invoice.settled).toBeTruthy()
    })
  })
})
