'use strict'

const { TYPE_BY_SLOTS } = require('../constants')
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
   * @param {Object} dependencies.vehiclesModel - Vehicles model
   * @param {Object} dependencies.invoicesModel - Invoices model
   */
  constructor (dependencies = {}) {
    const {
      lotsModel,
      slotsModel,
      entryPointsModel,
      vehiclesModel,
      invoicesModel
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

    if (vehiclesModel === undefined) {
      throw new Error('vehiclesModel should be provided')
    }

    if (invoicesModel === undefined) {
      throw new Error('invoicesModel should be provided')
    }

    this.slotsModel = slotsModel
    this.lotsModel = lotsModel
    this.entryPointsModel = entryPointsModel
    this.vehiclesModel = vehiclesModel
    this.invoicesModel = invoicesModel
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

    const createdSlots = await this.slotsModel.bulkCreate(lotId, _slots)

    return createdSlots.map(Slot.format)
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
   * Retrieves slot's complete details of given Id
   * @param {string} slotId - Slot Id
   * @returns {Promise<Object>} - Retrieved slot
   */
  async get (slotId) {
    const slot = await this.slotsModel.getById(slotId)

    if (!slot) {
      throw new NotFoundError('slot')
    }

    const invoice = await this.invoicesModel.getBySlot(slotId)

    if (invoice === null) {
      return Slot.format(slot)
    }

    const vehicle = await this.vehiclesModel.getByVin(invoice.vin)

    if (!vehicle) {
      throw new NotFoundError('vehicle')
    }

    return Slot.format(slot, {
      vehicle,
      invoice
    })
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
   * @param {Object} otherInfo - Other info
   * @param {Object} otherInfo.vehicle - Vehicle
   * @param {Object} otherInfo.invoice - Invoice
   * @returns {Object} - Formatted slot
   */
  static format (slot, otherInfo = {}) {
    const {
      vehicle,
      invoice
    } = otherInfo

    slot.type = TYPE_BY_SLOTS[slot.type]
    slot.id = slot._id.toString()
    delete slot._id

    const slotInfo = {
      ...slot
    }

    if (vehicle !== undefined) {
      slotInfo.vehicle = {
        id: vehicle._id.toString(),
        vin: vehicle.vin,
        type: TYPE_BY_SLOTS[vehicle.type]
      }
    }

    if (invoice !== undefined) {
      slotInfo.invoice = {
        id: invoice._id.toString(),
        rate: invoice.rate
      }
    }

    return slotInfo
  }
}

module.exports = Slot
