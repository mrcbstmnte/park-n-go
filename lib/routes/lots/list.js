'use strict'

const helpers = require('@lib/helpers')

class LotCreateRoute {
  /**
   * @param {Object} router - Express router
   * @param {Object} context - Service context
   * @param {Object} context.controllers - Service controllers
   * @param {Object} context.controllers.lot - Lot controller
   */
  constructor (router, context) {
    this.router = router
    this.controller = context.controllers.lot
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.get(
      '/lots',
      this.createLot.bind(this)
    )
  }

  /**
   * Lists parking lots
   */
  async createLot (req, res, next) {
    try {
      const lots = await this.controller.list()

      res.json({
        ok: true,
        lots
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = LotCreateRoute
