'use strict'

const { ObjectId } = require('mongodb')

const { DuplicateKeyError } = require('@lib/errors')

/**
 * Entry Points Model
 */
class EntryPoints {
  /**
   * @param {MongoClient} client - MongoDB client
   * @param {Object} options - Options
   * @param {string} options.databaseName - Database name
   */
  constructor (client, options) {
    this.client = client
    this.db = client.db(options.databaseName)
    this.collection = this.db.collection(EntryPoints.collectionName)
  }

  /**
   * Collection name
   */
  static get collectionName () {
    return 'entryPoints'
  }

  /**
   * Setups up collection
   * @returns {Promise<void>} - Set up collection
   */
  async setupCollection () {
    await this.collection.createIndex({
      name: 1
    }, {
      unique: true
    })
  }

  /**
   * Creates an entry point
   * @param {string} lotId - Lot Id
   * @param {Object} entryPoint - Entry point
   * @param {string} lot.name - Name of the entry point
   * @param {Object} [options] - Options
   * @param {Object} [options.session] - MongoDB session
   * @returns {Promise<Object>} - Created entry point
   */
  async create (lotId, entryPoint, options = {}) {
    const now = new Date()

    try {
      const result = await this.collection.insertOne({
        lotId: new ObjectId(lotId),
        name: entryPoint.name,
        createdAt: now,
        updatedAt: now
      }, {
        session: options.session
      })

      return result.ops[0]
    } catch (error) {
      if (error.code === 11000) {
        throw new DuplicateKeyError('duplicate_name')
      }

      throw error
    }
  }

  /**
   * Creates multiple entry points
   * @param {string} lotId - Lot Id
   * @param {Object[]} entryPoints - Entry points
   * @param {string} entryPoints[].name - Entry point name
   * @param {Object} [options] - Options
   * @param {Object} [options.session] - Session
   * @returns {Promise<Object[]>} - Entry points created
   */
  async bulkCreate (lotId, entryPoints, options = {}) {
    const now = new Date()

    const entryPointsToCreate = []

    for (const entryPoint of entryPoints) {
      entryPointsToCreate.push({
        lotId: new ObjectId(lotId),
        name: entryPoint.name,
        createdAt: now,
        updatedAt: now
      })
    }

    try {
      const result = await this.collection.insertMany(entryPointsToCreate, {
        session: options.session
      })

      return result.ops
    } catch (error) {
      if (error.code === 11000) {
        throw new DuplicateKeyError('duplicate_name')
      }

      throw error
    }
  }

  /**
   * Lists all entry points for the given lot
   * @param {string} - lotId - Lot Id
   * @returns {Promise<Object[]>} - Entry points for the given lot
   */
  async list (lotId) {
    return this.collection.find({
      lotId: new ObjectId(lotId)
    }).toArray()
  }

  /**
   * Retrieves entry point of given Id
   * @param {string} entryPointId - Entry point Id
   * @returns {Promise<Object|null>} - Entry point
   */
  async getById (entryPointId) {
    return this.collection.findOne({
      _id: new ObjectId(entryPointId)
    })
  }

  /**
   * Checks if the entry point exists
   * @param {string} entryPoint - Entry point Id
   * @returns {Promise<boolean>} - Entry point exists
   */
  async exists (entryPoint) {
    const lot = await this.collection.findOne({
      _id: new ObjectId(entryPoint)
    })

    return lot !== null
  }

  /**
   * Deletes an entry point
   * @param {string} entryPointId - Entry point Id
   * @returns {Promise<void>} - Entry point deleted
   */
  async delete (entryPointId) {
    await this.collection.deleteOne({
      _id: new ObjectId(entryPointId)
    })
  }
}

module.exports = EntryPoints
