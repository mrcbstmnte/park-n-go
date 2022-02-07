'use strict'

const Ajv = require('ajv')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

class SlotGetRoute {
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
        slotId: {
          type: 'string',
          minLength: 1
        }
      },
      required: [
        'slotId'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.get(
      '/slot/:slotId',
      this.validate.bind(this),
      this.getSlot.bind(this)
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
   * Retrieves slot info
   */
  async getSlot (req, res, next) {
    const {
      slotId
    } = req.params

    try {
      const slot = await this.controller.get(slotId)

      res.json({
        ok: true,
        slot
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = SlotGetRoute
