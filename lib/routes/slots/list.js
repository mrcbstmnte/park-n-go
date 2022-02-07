'use strict'

const Ajv = require('ajv')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

class SlotListRoute {
  /**
   * @param {Object} router - Express router
   * @param {Object} context - Service context
   * @param {Object} context.controllers - Service controllers
   * @param {Object} context.controllers.slot - Slot controller
   */
  constructor (router, context) {
    this.router = router
    this.controller = context.controllers.slot

    const ajv = new Ajv()

    this.validator = ajv.compile({
      type: 'object',
      properties: {
        lotId: {
          type: 'string',
          minLength: 1
        }
      },
      required: [
        'lotId'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.get(
      '/slots/:lotId',
      this.validate.bind(this),
      this.listSlots.bind(this)
    )
  }

  /**
   * Validates request
   */
  validate (req, res, next) {
    const isValid = this.validator(req.params)

    if (!isValid) {
      const { path } = helpers.getError(this.validator.errors)

      return next(helpers.resolveApiError(new BusinessLogicError(path)))
    }

    next()
  }

  /**
   * Lists all slot
   */
  async listSlots (req, res, next) {
    const {
      lotId
    } = req.params

    try {
      const slots = await this.controller.list(lotId)

      res.json({
        ok: true,
        slots
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = SlotListRoute
