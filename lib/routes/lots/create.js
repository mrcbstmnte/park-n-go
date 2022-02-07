'use strict'

const Ajv = require('ajv')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

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

    const ajv = new Ajv()

    this.validator = ajv.compile({
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1
        },
        entryPoints: {
          type: 'integer',
          minimum: 3
        }
      },
      required: [
        'name',
        'entryPoints'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.post(
      '/lot',
      this.validate.bind(this),
      this.createLot.bind(this)
    )
  }

  /**
   * Validates request
   */
  validate (req, res, next) {
    const isValid = this.validator(req.body)

    if (!isValid) {
      const { path } = helpers.getError(this.validator.errors)

      return next(helpers.resolveApiError(new BusinessLogicError(path)))
    }

    next()
  }

  /**
   * Creates a lot
   */
  async createLot (req, res, next) {
    const {
      name,
      entryPoints
    } = req.body

    try {
      const lot = await this.controller.create(name, entryPoints)

      res.json({
        ok: true,
        lot
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = LotCreateRoute
