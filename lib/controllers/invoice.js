'use strict'

const config = require('@config')

const MongoHelper = require('@lib/helpers/mongodb')
const {
  NotFoundError,
  BusinessLogicError
} = require('@lib/errors')

const formulas = require('@lib/formulas')

const {
  TYPE_BY_SLOTS,
  ONE_DAY_IN_HR,
  ONE_HOUR_IN_MS
} = require('@lib/constants')

/**
 * Invoice controller
 */
class Invoice {
  /**
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.invoicesModel - Invoices Model
   * @param {Object} dependencies.slotsModel - Slots Model
   * @param {Object} dependencies.entryPointsModel - Entry points Model
   * @param {Object} dependencies.vehiclesModel - Vehicles Model
   */
  constructor (dependencies = {}) {
    const {
      invoicesModel,
      slotsModel,
      entryPointsModel,
      vehiclesModel
    } = dependencies

    if (invoicesModel === undefined) {
      throw new Error('invoicesModel should be provided')
    }

    if (slotsModel === undefined) {
      throw new Error('slotsModel should be provided')
    }

    if (entryPointsModel === undefined) {
      throw new Error('entryPointsModel should be provided')
    }

    if (vehiclesModel === undefined) {
      throw new Error('vehiclesModel should be provided')
    }

    this.invoicesModel = invoicesModel
    this.slotsModel = slotsModel
    this.entryPointsModel = entryPointsModel
    this.vehiclesModel = vehiclesModel
  }

  /**
   * Creates an invoice
   * @param {string} entryPointId - Entry point Id
   * @param {Object} vehicle - Vehicle
   * @param {string} vehicle.type - Vehicle type
   * @param {string} vehicle.vin - VIN
   * @param {Object} options - Options
   * @param {string} [options.startDate] - Start date
   * @returns {Promise<void>} - Created invoice
   */
  async create (entryPointId, vehicle, options = {}) {
    const {
      startDate = new Date()
    } = options

    const entryPoint = await this.entryPointsModel.getById(entryPointId)

    if (!entryPoint) {
      throw new NotFoundError('entry_point')
    }

    const lotId = entryPoint.lotId.toString()

    const nearestSlot = await this.slotsModel.findNearest(lotId, {
      type: vehicle.type,
      entryPointId
    })

    if (!nearestSlot) {
      throw new BusinessLogicError('no_slots_available')
    }

    const slotId = nearestSlot._id.toString()

    const session = MongoHelper.startSession(this.invoicesModel.client)

    try {
      await session.withTransaction(async () => {
        const createdVehicle = await this.vehiclesModel.create(vehicle, {
          session
        })

        const slotType = TYPE_BY_SLOTS[nearestSlot.type]
        const hourlyRate = config.rates.hourly[slotType]

        const lastVisited = new Date(createdVehicle.lastVisit?.date || null)
        const timeAway = Invoice.computeTimeDiff(lastVisited, startDate, Math.round)

        const isContinuous = timeAway <= config.awayThreshold

        await this.invoicesModel.create(slotId, {
          vin: vehicle.vin,
          rate: hourlyRate,
          isContinuous
        }, {
          session
        })

        await this.slotsModel.updateOccupancy(slotId, {
          occupied: true
        }, {
          session
        })
      })
    } finally {
      await session.endSession()
    }
  }

  /**
   * Settles invoice
   * @param {string} invoiceId - Invoice Id
   * @param {Object} options - Options
   * @param {Date} [options.endDate] - End date
   * @returns {Promise<Object>} - Settled invoice
   */
  async settle (invoiceId, options = {}) {
    const {
      endDate = new Date()
    } = options

    const invoice = await this.invoicesModel.getById(invoiceId)

    if (!invoice) {
      throw new NotFoundError('invoice')
    }

    if (invoice.settled) {
      throw new BusinessLogicError('already_settled')
    }

    if (endDate < invoice.createdAt) {
      throw new BusinessLogicError('invalid_end_date')
    }

    const vin = invoice.vin
    const isContinuous = invoice.isContinuous
    const vehicle = await this.vehiclesModel.getByVin(vin)

    if (!vehicle) {
      throw new NotFoundError('vehicle')
    }

    const session = MongoHelper.startSession(this.invoicesModel.client)

    let settledInvoice

    try {
      await session.withTransaction(async () => {
        await this.slotsModel.updateOccupancy(invoice.slotId, {
          occupied: false
        }, {
          session
        })

        const startDate = new Date(invoice.createdAt)
        const flatRate = Invoice.computeFlatRate(isContinuous)
        const timeDiff = Invoice.computeTimeDiff(startDate, new Date(endDate))

        // Carry over previous hours for
        // continuous rate
        const stayDuration = isContinuous
          ? timeDiff + vehicle.lastVisit.duration
          : timeDiff

        const payment = Invoice.computePayment(invoice, flatRate, stayDuration)

        await this.vehiclesModel.updateLastVisit(vin, {
          date: endDate,
          duration: stayDuration
        }, {
          session
        })

        settledInvoice = await this.invoicesModel.settle(invoiceId, payment, {
          session
        })
      })
    } finally {
      await session.endSession()
    }

    return settledInvoice
  }

  /**
   * Computes the flat rate
   * @param {boolean} isContinuous - Determines if rate is continuous
   * @returns {number} - Flat rate
   */
  static computeFlatRate (isContinuous) {
    return isContinuous
      ? 0
      : config.rates.flat
  }

  /**
   * Computes the payment amount
   * @param {Object} invoice - Invoice
   * @param {number} invoice.hourlyRate - Slot rate
   * @param {number} flatRate - Flat rate
   * @param {number} numHours - Number of hours
   * @returns {number} - Payment amount
   */
  static computePayment (invoice, flatRate, numHours) {
    const { hourlyRate } = invoice

    if (numHours >= ONE_DAY_IN_HR) {
      return formulas.full(hourlyRate, numHours)
    }

    return flatRate + formulas.normal(hourlyRate, numHours)
  }

  /**
   * Computes time difference
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @param {Object} options - Options
   * @param {Function} [options.mechanism] - Rounding mechanism
   * @param {number} [options.divisor] - Divisor
   * @returns {number} - Time difference
   */
  static computeTimeDiff (start, end, options = {}) {
    const {
      mechanism = Math.ceil,
      divisor = ONE_HOUR_IN_MS
    } = options

    return mechanism((end - start) / divisor)
  }
}

module.exports = Invoice
