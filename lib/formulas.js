'use strict'

const config = require('@config')
const { ONE_DAY_IN_HR } = require('./constants')

/**
 * Computes payment for normal usage
 * @param {number} rate - Hourly rate
 * @param {number} numHours - Number of hours the vehicle stayed
 * @returns {number} - Payment computation
 */
exports.normal = function normal (rate, numHours) {
  if (numHours <= config.chargeThreshold) {
    return 0
  }

  return rate * (numHours - config.chargeThreshold)
}

/**
 * Computes payment for full usage
 * @param {number} rate - Hourly rate
 * @param {number} numHours - Number of hours the vehicle stayed
 * @returns {number} - Payment computation
 */
exports.full = function full (rate, numHours) {
  const numDays = Math.floor(numHours / ONE_DAY_IN_HR)
  const exceedingHours = numHours % ONE_DAY_IN_HR

  const daysPayment = numDays * config.rates.wholeDay

  if (exceedingHours === 0) {
    return daysPayment
  }

  return daysPayment + (exceedingHours * rate)
}
