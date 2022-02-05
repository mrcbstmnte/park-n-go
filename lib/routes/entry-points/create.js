'use strict'

const Ajv = require('ajv')

const helpers = require('@lib/helpers')
const { BusinessLogicError } = require('@/lib/errors')

class EntryPointCreateRoute {
  /**
   * @param {Object} router - Express router
   * @param {Object} context - Service context
   * @param {Object} context.controllers - Service controllers
   * @param {Object} context.controllers.entryPoint - Entry point controller
   */
  constructor (router, context) {
    this.router = router
    this.controller = context.controllers.entryPoint

    const ajv = new Ajv()

    this.validator = ajv.compile({
      type: 'object',
      properties: {
        lotId: {
          type: 'string',
          minLength: 1
        },
        name: {
          type: 'string',
          minLength: 1
        }
      },
      required: [
        'lotId',
        'name'
      ],
      additionalProperties: false
    })
  }

  /**
   * Sets up route
   */
  setupRoutes () {
    this.router.post(
      '/entry-point',
      this.validate.bind(this),
      this.createEntryPoint.bind(this)
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
   * Creates an entry point
   */
  async createEntryPoint (req, res, next) {
    const {
      lotId,
      name
    } = req.body

    try {
      const entryPoint = await this.controller.create(lotId, name)

      res.json({
        ok: true,
        entryPoint
      })
    } catch (error) {
      return next(helpers.resolveApiError(error))
    }
  }
}

module.exports = EntryPointCreateRoute
