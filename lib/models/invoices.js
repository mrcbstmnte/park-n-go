'use strict'

const { ObjectId } = require('mongodb')

class Invoices {
  /**
   * @param {MongoClient} client - MongoDB client
   * @param {Object} options - Options
   * @param {string} options.databaseName - Database name
   */
  constructor (client, options) {
    this.client = client
    this.db = client.db(options.databaseName)
    this.collection = this.db.collection(Invoices.collectionName)
  }

  /**
   * Collection name
   */
  static get collectionName () {
    return 'invoices'
  }

  /**
   * Creates an invoice
   * @param {string} slotId - Slot Id
   * @param {Object} details - Invoice details
   * @param {string} details.vin - VIN
   * @param {number} details.rate - Hourly rate of the slot
   * @param {boolean} details.isContinuous - Flag to indicate if continuous rate
   * @param {Object} options - Options
   * @param {Object} [options.session] - MongoDB session
   * @returns {Promise<Object>} - Created invoice
   */
  async create (slotId, details, options = {}) {
    const now = new Date()

    const result = await this.collection.insertOne({
      slotId: new ObjectId(slotId),
      vin: details.vin,
      amount: 0,
      settled: false,
      isContinuous: details.isContinuous || false,
      hourlyRate: details.rate,
      createdAt: now,
      updatedAt: now
    }, {
      session: options.session
    })

    return result.ops[0]
  }

  /**
   * Retrieves the invoice of given Id
   * @param {string} invoiceId - Invoice Id
   * @returns {Promise<Object>} - Invoice
   */
  async getById (invoiceId) {
    return this.collection.findOne({
      _id: new ObjectId(invoiceId)
    })
  }

  /**
   * Settles the invoice
   * @param {string} invoiceId - Invoice Id
   * @param {number} amount - Amount to pay
   * @param {Object} options - Options
   * @param {Object} [options.session] - MongoDB session
   * @param {string} [options.endDate] - Custom end date
   * @returns {Promise<void>} - Invoice settled
   */
  async settle (invoiceId, amount, options = {}) {
    const {
      endDate,
      session
    } = options

    const updates = {
      $set: {
        amount,
        settled: true,
        updatedAt: new Date()
      }
    }

    if (endDate !== undefined) {
      updates.$set.updatedAt = new Date(endDate)
    }

    const result = await this.collection.findOneAndUpdate({
      _id: new ObjectId(invoiceId)
    }, updates, {
      returnDocument: 'after',
      session
    })

    return result.value
  }
}

module.exports = Invoices
