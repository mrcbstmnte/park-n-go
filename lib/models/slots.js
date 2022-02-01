'use strict'

const { customAlphabet } = require('nanoid')
const { ObjectId } = require('mongodb')

const { DuplicateKeyError } = require('@lib/errors')

const { SLOTS_BY_TYPE } = require('@lib/constants')

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

class Slots {
  /**
   * @param {MongoClient} client - MongoDB client
   * @param {Object} options - Options
   * @param {string} options.databaseName - Database name
   */
  constructor (client, options) {
    this.client = client
    this.db = client.db(options.databaseName)
    this.collection = this.db.collection(Slots.collectionName)
  }

  /**
   * Collection name
   */
  static get collectionName () {
    return 'slots'
  }

  /**
   * Setups up collection
   * @returns {Promise<void>} - Set up collection
   */
  async setupCollection () {
    await this.collection.createIndex({
      label: 1
    }, {
      unique: true
    })
  }

  /**
   * Generates a unique random label
   * @returns {string} - Generated label
   */
  static generateLabel () {
    return nanoid()
  }

  /**
   * Create multiple slots for a given lot Id
   * @param {string} lotId - Lot Id
   * @param {Object[]} slots - Slots
   * @param {string} slots[].type - Slot type/size
   * @param {Object} slots[].distance - Distance to entry point
   * @param {Object} options - Options
   * @param {Object} [options.session] - MongoDB session
   * @returns {Promise<Object>} - Created slot
   */
  async bulkCreate (lotId, slots, options = {}) {
    const now = new Date()
    const toCreate = []

    for (const slot of slots) {
      toCreate.push({
        lotId: new ObjectId(lotId),
        label: Slots.generateLabel(),
        type: SLOTS_BY_TYPE[slot.type],
        distance: slot.distance,
        occupied: false,
        createdAt: now,
        updatedAt: now
      })
    }

    try {
      const result = await this.collection.insertMany(toCreate, {
        session: options.session
      })

      return result.ops
    } catch (error) {
      if (error.code === 11000) {
        throw new DuplicateKeyError('duplicate_label')
      }

      throw error
    }
  }

  /**
   * Finds the nearest available slot
   * @param {string} lotId - Lot Id
   * @param {Object} details - Addt'l details
   * @param {string} details.entryPointId - Entry point Id
   * @param {string} details.type - Vehicle type
   * @returns {Promise<Object>} - Nearest slot
   */
  async findNearest (lotId, details) {
    const {
      type,
      entryPointId
    } = details

    return this.collection.findOne({
      lotId: new ObjectId(lotId),
      occupied: false,
      type: {
        $gte: SLOTS_BY_TYPE[type]
      }
    }, {
      sort: {
        [`distance.${entryPointId}`]: 1,
        type: 1
      }
    })
  }

  /**
   * List all slots of given lot Id
   * @param {string} lotId - Lot Id
   * @returns {Promise<Object[]>} - List of all slots of given lot Id
   */
  async list (lotId) {
    return this.collection.find({
      lotId: new ObjectId(lotId)
    }).toArray()
  }

  /**
   * Updates slots and add new entry points to the distance property
   * @param {string} lotId - Lot Id
   * @param {string} entryPointId - Entry point Id
   * @param {Object} options - Options
   * @param {Object} [options.session] - MongDB session
   * @returns {Promise<void>} - Updated slots
   */
  async addNewEntryPoints (lotId, entryPointId, options = {}) {
    const now = new Date()

    await this.collection.updateMany({
      lotId: new ObjectId(lotId)
    }, {
      $set: {
        // Assuming that the newly added
        // slot is farther from the entry point
        [`distance.${entryPointId}`]: 1,
        updatedAt: now
      }
    }, {
      session: options.session
    })
  }

  /**
   * Updates a slot of given Id
   * @param {string} slotId - Slot Id
   * @param {Object} slot - Slot
   * @param {boolean} slot.occupied - If the slot has been occupied
   * @param {Object} options - Options
   * @param {Object} [options.session] - MongoDB session
   * @returns {Promise<void>} - Slot updated
   */
  async updateOccupancy (slotId, slot, options = {}) {
    await this.collection.findOneAndUpdate({
      _id: new ObjectId(slotId)
    }, {
      $set: {
        occupied: slot.occupied,
        updatedAt: new Date()
      }
    }, {
      session: options.session
    })
  }
}

module.exports = Slots
