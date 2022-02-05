'use strict'

const express = require('express')
const bodyParser = require('body-parser')

exports.createMockServer = function (router) {
  const app = express()

  app.use(bodyParser.json())
  app.use(router)

  return app
}

exports.getConfig = function () {
  return {
    service: {
      port: 3004
    },

    mongodb: {
      databaseName: 'test',
      connectUri: 'mongodb://mongodb1:27401'
    }
  }
}
