'use strict'

const MongoHelper = require('@lib/helpers/mongodb')

/**
 * Lot controller
 */
class Lot {
  /**
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.lotsModel - Lots Model
   * @param {Object} dependencies.entryPointsModel - Entry points Model
   */
  constructor (dependencies = {}) {
    const {
      lotsModel,
      entryPointsModel
    } = dependencies

    if (lotsModel === undefined) {
      throw new Error('lotsModel should be provided')
    }

    if (entryPointsModel === undefined) {
      throw new Error('entryPointsModel should be provided')
    }

    this.lotsModel = lotsModel
    this.entryPointsModel = entryPointsModel
  }

  /**
   * Formats given lot to response object
   * @param {Object} lot - Lot
   * @returns {Object} - Formatted lot
   */
  static format (lot) {
    lot.id = lot._id.toString()
    delete lot._id

    return lot
  }

  /**
   * Creates parking lot
   * @param {string} name - Parking lot name
   * @param {number} numEntryPoints - Number of entry points
   * @returns {Promise<Object>} - Parking lot created
   */
  async create (name, numEntryPoints) {
    const session = MongoHelper.startSession(this.lotsModel.client)

    let lot

    try {
      await session.withTransaction(async () => {
        lot = await this.lotsModel.create({
          name,
          entryPoints: numEntryPoints
        }, {
          session
        })

        const entryPoints = []

        for (let i = 1; i < numEntryPoints + 1; i++) {
          entryPoints.push({
            name: i.toString()
          })
        }

        const lotId = lot._id.toString()

        await this.entryPointsModel.bulkCreate(lotId, entryPoints, {
          session
        })
      })
    } finally {
      await session.endSession()
    }

    return Lot.format(lot)
  }

  /**
   * Lists all parking lots
   * @returns {Promise<Object[]>} - Parking lots
   */
  async list () {
    const lots = await this.lotsModel.list()

    return lots.map(Lot.format)
  }
}

module.exports = Lot
