'use strict'

class MongoDBTestHelper {
  static getMockClientSession () {
    return {
      withTransaction: jest.fn().mockImplementation(async function (fn) {
        await fn()
      }),
      endSession: jest.fn().mockResolvedValue()
    }
  }
}

module.exports = MongoDBTestHelper
