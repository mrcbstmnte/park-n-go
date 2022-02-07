'use strict'

/**
 * Vehicles Model
 */
class Vehicles {
  /**
   * @param {MongoClient} client - MongoDB client
   * @param {Object} options - Options
   * @param {string} options.databaseName - Database name
   */
  constructor (client, options) {
    this.client = client
    this.db = client.db(options.databaseName)

    // this.db.createCollection(Vehicles.collectionName)

    this.collection = this.db.collection(Vehicles.collectionName)

    this.setupCollection()
  }

  /**
   * Collection name
   */
  static get collectionName () {
    return 'vehicles'
  }

  /**
   * Setups up collection
   * @returns {Promise<void>} - Set up collection
   */
  async setupCollection () {
    await this.collection.createIndex({
      vin: 1
    }, {
      unique: true
    })
  }

  /**
   * Creates a vehicle
   * @param {Object} vehicle - Entry point
   * @param {string} vehicle.vin - VIN
   * @param {number} vehicle.type - Vehicle type
   * @param {Object} [options] - Options
   * @param {Object} [options.session] - MongoDB session
   * @returns {Promise<Object>} - Created vehicle
   */
  async create (vehicle, options = {}) {
    const now = new Date()

    const result = await this.collection.findOneAndUpdate({
      vin: vehicle.vin
    }, {
      $set: {
        type: vehicle.type,
        createdAt: now,
        updatedAt: now
      }
    }, {
      upsert: true,
      returnDocument: 'after',
      session: options.session
    })

    return result.value
  }

  /**
   * Retrieves vehicle of given VIN
   * @param {string} vin - VIN
   * @returns {Promise<Object|null>} - Vehicle
   */
  async getByVin (vin) {
    return this.collection.findOne({
      vin
    })
  }

  /**
   * Updates the vehicle's last visit date
   * @param {string} vin - Vehicle Id
   * @param {Object} options - Options
   * @param {Object} lastVisit - Last visit object
   * @param {number} lastVisit.duration - Number of hours stayed
   * @param {Date} lastVisit.date - Date of park out
   * @param {Object} [options.session] - MongoDB session
   * @returns {Promise<Object>} - Updated vehicle
   */
  async updateLastVisit (vin, lastVisit, options = {}) {
    const {
      session
    } = options

    const updates = {
      $set: {
        updatedAt: new Date(),
        lastVisit: {
          duration: lastVisit.duration,
          date: new Date(lastVisit.date)
        }
      }
    }

    const result = await this.collection.findOneAndUpdate({
      vin
    }, updates, {
      returnDocument: 'after',
      session: session
    })

    return result.value
  }
}

module.exports = Vehicles
