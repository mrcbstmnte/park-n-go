'use strict'

const Ajv = require('ajv')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

class SlotCreateRoute {
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
        },
        slots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'small',
                  'medium',
                  'large'
                ]
              },
              distance: {
                type: 'object',
                minProperties: 1
              }
            },
            required: [
              'type',
              'distance'
            ]
          },
          minItems: 1
        }
      },
      required: [
        'lotId',
        'slots'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.post(
      '/slot',
      this.validate.bind(this),
      this.createSlot.bind(this)
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
   * Creates a slot
   */
  async createSlot (req, res, next) {
    const {
      lotId,
      slots
    } = req.body

    try {
      const createdSlots = await this.controller.create(lotId, slots)

      res.json({
        ok: true,
        slots: createdSlots
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = SlotCreateRoute
