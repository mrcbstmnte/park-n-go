'use strict'

const path = require('path')
const glob = require('glob')

/**
 * Setups routes found in given routes path for given express router
 * @param {String} pathToRoutes - Path to routes
 * @param {Object} router - Instances of express router
 * @param {Object} context - Context for routes, normally the host application
 */
exports.setup = function (pathToRoutes, router, context) {
  glob.sync('**/*.js', {
    cwd: pathToRoutes
  }).forEach(function (file) {
    const Route = require(path.resolve(pathToRoutes, file))

    if (typeof Route !== 'function') {
      throw new TypeError(`${file} is not exported as function`)
    }

    if (Route.exclude === true) {
      return
    }

    const route = new Route(router, context)

    if (typeof route.setupRoutes !== 'function') {
      throw new TypeError(`${file} does not have setupRoutes interface`)
    }

    route.setupRoutes()
  })
}
