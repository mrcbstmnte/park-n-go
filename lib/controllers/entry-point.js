'use strict'

const MongoHelper = require('@lib/helpers/mongodb')
const { NotFoundError } = require('../errors')

class EntryPoint {
  /**
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.entryPointsModel - Entry points Model
   * @param {Object} dependencies.slotsModel - Slots Model
   * @param {Object} dependencies.lotsModel - Lots Model
   */
  constructor (dependencies = {}) {
    const {
      entryPointsModel,
      slotsModel,
      lotsModel
    } = dependencies

    if (entryPointsModel === undefined) {
      throw new Error('entryPointsModel should be provided')
    }

    if (slotsModel === undefined) {
      throw new Error('slotsModel should be provided')
    }

    if (lotsModel === undefined) {
      throw new Error('lotsModel should be provided')
    }

    this.entryPointsModel = entryPointsModel
    this.slotsModel = slotsModel
    this.lotsModel = lotsModel
  }

  /**
   * Formats entry point
   * @param {Object} entryPoint - Entry point
   * @returns {Object} - Formatted entry point
   */
  static format (entryPoint) {
    entryPoint.id = entryPoint._id.toString()
    delete entryPoint._id

    return entryPoint
  }

  /**
   * Creates new entry point
   * @param {string} lotId - Lot Id
   * @param {string} name - Entry point name
   * @returns {Promise<Object>} - Created entry point
   */
  async create (lotId, name) {
    const lotExist = await this.lotsModel.exists(lotId)

    if (!lotExist) {
      throw new NotFoundError('lot')
    }

    const session = MongoHelper.startSession(this.entryPointsModel.client)

    let entryPoint

    try {
      await session.withTransaction(async () => {
        entryPoint = await this.entryPointsModel.create(lotId, {
          name
        }, {
          session
        })

        await this.slotsModel.addNewEntryPoint(lotId, entryPoint._id.toString(), {
          session
        })
      })
    } finally {
      await session.endSession()
    }

    return EntryPoint.format(entryPoint)
  }

  /**
   * List all entry points of a parking lot
   * @param {string} lotId - Lot Id
   * @returns {Promise<Object[]>} - Parking lot's entry points
   */
  async list (lotId) {
    const entryPoints = await this.entryPointsModel.list(lotId)

    return entryPoints.map(EntryPoint.format)
  }
}

module.exports = EntryPoint
