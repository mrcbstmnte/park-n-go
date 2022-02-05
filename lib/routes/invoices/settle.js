'use strict'

const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

class InvoiceSettleRoute {
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
        invoiceId: {
          type: 'string',
          minLength: 1
        },
        endDate: {
          type: 'string',
          format: 'date-time'
        }
      },
      required: [
        'invoiceId'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.post(
      '/settle',
      this.validate.bind(this),
      this.settleInvoice.bind(this)
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
   * Settles an invoice
   */
  async settleInvoice (req, res, next) {
    const {
      invoiceId,
      endDate
    } = req.body

    try {
      const invoice = await this.controller.settle(invoiceId, {
        endDate
      })

      res.json({
        ok: true,
        invoice
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = InvoiceSettleRoute
