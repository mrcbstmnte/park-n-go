'use strict'

class MongoHelper {
  /**
   * Starts a new session from the server
   * @param {MongoClient} client
   */
  static startSession (client) {
    return client.startSession({
      defaultTransactionOptions: {
        readConcern: {
          level: 'majority'
        },
        writeConcern: {
          w: 'majority'
        }
      }
    })
  }
}

module.exports = MongoHelper
