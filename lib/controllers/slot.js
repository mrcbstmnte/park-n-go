'use strict'

const { NotFoundError } = require('../errors')

/**
 * Slot controller
 */
class Slot {
  /**
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.lotsModel - Lots Model
   * @param {Object} dependencies.slotsModel - Slots Model
   * @param {Object} dependencies.entryPointsModel - Entry points model
   */
  constructor (dependencies = {}) {
    const {
      lotsModel,
      slotsModel,
      entryPointsModel
    } = dependencies

    if (slotsModel === undefined) {
      throw new Error('slotsModel should be provided')
    }

    if (lotsModel === undefined) {
      throw new Error('lotsModel should be provided')
    }

    if (entryPointsModel === undefined) {
      throw new Error('entryPointsModel should be provided')
    }

    this.slotsModel = slotsModel
    this.lotsModel = lotsModel
    this.entryPointsModel = entryPointsModel
  }

  /**
   * Creates a slot for the parking lot
   * @param {string} lotId - Lot Id
   * @param {Object[]} slots - Slots
   * @param {string} slots[].type - Slot type
   * @param {Object} slots[].distance - Slot's distance to entry points
   * @returns {Promise} - Created slot
   */
  async create (lotId, slots) {
    const lotExists = await this.lotsModel.exists(lotId)

    if (!lotExists) {
      throw new NotFoundError('lot')
    }

    // Entry points mapped with the distance having
    // a default value of `1`
    const entryPointsById = await this.entryPointsModel.list(lotId, {
      accumulator: {},
      iterator: function (accumulator, document) {
        accumulator[document._id.toString()] = 1
      }
    })

    const _slots = slots.map(Slot.buildSlot.bind(null, entryPointsById))

    return this.slotsModel.bulkCreate(lotId, _slots)
  }

  /**
   * Build slot
   * @param {Object} slot - Slot
   * @param {string} slot.type - Slot type
   * @param {Object} slot.distance - Distance to entry points
   * @returns {Object} - Built slot
   */
  static buildSlot (defaultDistance, slot) {
    return {
      type: slot.type,
      distance: Slot.buildDistance(slot.distance, defaultDistance)
    }
  }

  /**
   * Builds distance based on the distance provided by the user and
   *  defined in the entry points
   *
   * @param {Object} distance - Distance defined by the user
   * @param {Object} storedDistance - Default distance based on entry points
   * @returns {Object} - Built distance
   */
  static buildDistance (distance, storedDistance) {
    const completeDist = {}

    for (const key in storedDistance) {
      if (distance[key] !== undefined) {
        completeDist[key] = distance[key]

        continue
      }

      completeDist[key] = storedDistance[key]
    }

    return completeDist
  }

  /**
   * Lists all parking lot slots
   * @param {string} lotId - Lot Id
   * @returns {Promise<Object[]>} - Parking lot slots
   */
  async list (lotId) {
    const lotExist = await this.lotsModel.exists(lotId)

    if (!lotExist) {
      throw new NotFoundError('lot')
    }

    const slots = await this.slotsModel.list(lotId)

    return slots.map(Slot.format)
  }

  /**
   * Formats slot
   * @param {Object} slot - Slot
   * @returns {Object} - Formatted slot
   */
  static format (slot) {
    slot.id = slot._id.toString()
    delete slot._id

    return slot
  }
}

module.exports = Slot
