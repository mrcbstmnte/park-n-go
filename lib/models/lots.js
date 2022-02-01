'use strict'

const { ObjectId } = require('mongodb')

/**
 * Lots Model
 */
class Lots {
  /**
   * @param {MongoClient} client - MongoDB client
   * @param {Object} options - Options
   * @param {string} options.databaseName - Database name
   */
  constructor (client, options) {
    this.client = client
    this.db = client.db(options.databaseName)
    this.collection = this.db.collection(Lots.collectionName)
  }

  /**
   * Collection name
   */
  static get collectionName () {
    return 'lots'
  }

  /**
   * Creates a lot
   * @param {Object} lot - Lot
   * @param {string} lot.name - Name of the lot
   * @param {number} lot.entryPoints - Number of entry points
   * @returns {Promise<Object>} - Created lot
   */
  async create (lot) {
    const now = new Date()

    const result = await this.collection.insertOne({
      name: lot.name,
      entryPoints: lot.entryPoints || 3,
      createdAt: now,
      updatedAt: now
    })

    return result.ops[0]
  }

  /**
   * Lists all parking lots
   * @returns {Promise<Object[]>} - Parking lots
   */
  async list () {
    return this.collection.find().toArray()
  }

  /**
   * Checks if the parking lot exists
   * @param {string} lotId - Lot Id
   * @returns {Promise<boolean>} - Parking lot exists
   */
  async exists (lotId) {
    const lot = await this.collection.findOne({
      _id: new ObjectId(lotId)
    })

    return lot !== null
  }

  /**
   * Deletes a parking lot
   * @param {string} lotId - Lot Id
   * @returns {Promise<void>} - Lot deleted
   */
  async delete (lotId) {
    await this.collection.deleteOne({
      _id: new ObjectId(lotId)
    })
  }
}

module.exports = Lots
