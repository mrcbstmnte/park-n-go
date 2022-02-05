'use strict'

const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

class InvoiceCreateRoute {
  /**
   * @param {Object} router - Express router
   * @param {Object} context - Service context
   * @param {Object} context.controllers - Service controllers
   * @param {Object} context.controllers.invoice - Invoice controller
   */
  constructor (router, context) {
    this.router = router
    this.controller = context.controllers.invoice

    const ajv = new Ajv()

    addFormats(ajv)

    this.validator = ajv.compile({
      type: 'object',
      properties: {
        entryPointId: {
          type: 'string',
          minLength: 1
        },
        vehicle: {
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
            vin: {
              type: 'string',
              minLength: 1
            }
          },
          required: [
            'type',
            'vin'
          ]
        },
        startDate: {
          type: 'string',
          format: 'date-time'
        }
      },
      required: [
        'entryPointId',
        'vehicle'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.post(
      '/invoice',
      this.validate.bind(this),
      this.createInvoice.bind(this)
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
   * Creates an invoice
   */
  async createInvoice (req, res, next) {
    const {
      entryPointId,
      vehicle,
      startDate
    } = req.body

    try {
      await this.controller.create(entryPointId, vehicle, {
        startDate
      })

      res.json({
        ok: true
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = InvoiceCreateRoute
