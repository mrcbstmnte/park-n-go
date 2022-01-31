'use strict'

const {
  APP_PORT,

  MONGO_PORT,
  MONGO_DB_NAME,

  FLAT_RATE,
  WHOLE_DAY_RATE,

  FLAT_RATE_HOURS = '3',
  GRACE_PERIOD_HOURS = '1',

  SLOT_RATE_SMALL = '20',
  SLOT_RATE_MEDIUM = '60',
  SLOT_RATE_LARGE = '100'
} = process.env

module.exports = {
  service: {
    port: parseInt(APP_PORT, 10)
  },

  mongodb: {
    databaseName: MONGO_DB_NAME,
    connectUri: `mongodb://mongodb:${MONGO_PORT}`
  },

  rates: {
    flat: parseInt(FLAT_RATE, 10),
    wholeDay: parseInt(WHOLE_DAY_RATE, 10),

    hourly: {
      small: parseInt(SLOT_RATE_SMALL, 10),
      medium: parseInt(SLOT_RATE_MEDIUM, 10),
      large: parseInt(SLOT_RATE_LARGE, 10)
    }
  },

  gracePeriod: parseInt(GRACE_PERIOD_HOURS, 10),
  chargeThreshold: parseInt(FLAT_RATE_HOURS, 10)
}
