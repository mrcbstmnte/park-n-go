'use strict'

const path = require('path')

const {
  MongoClient
} = require('mongodb')

const express = require('express')
const bodyParser = require('body-parser')

const LotsModel = require('@models/lots')
const SlotsModel = require('@models/slots')
const EntryPointsModel = require('@models/entry-points')
const VehiclesModel = require('@models/vehicles')
const InvoicesModel = require('@models/invoices')

const LotController = require('@lib/controllers/lot')
const SlotController = require('@lib/controllers/slot')
const EntryPointController = require('@lib/controllers/entry-point')
const InvoiceController = require('@lib/controllers/invoice')

const router = require('@lib/router')
const errorHandler = require('@lib/middlewares/error-handler')

class Service {
  /**
   * @param {Object} config - App configuration
   */
  constructor (config) {
    this.models = {}
    this.controllers = {}

    this.config = config
  }

  /**
   * Starts the service
   */
  async start () {
    await this.setupDependencies()
    this.setupServer()
  }

  /**
   * Sets up dependencies
   */
  async setupDependencies () {
    const {
      mongodb
    } = this.config

    this.app = express()

    this.router = express.Router()

    const mongoClient = new MongoClient(`${mongodb.connectUri}`, {
      useUnifiedTopology: true,
      writeConcern: 'majority',
      ignoreUndefined: true,
      retryWrites: false
    })

    await mongoClient.connect()

    const modelOptions = {
      databaseName: mongodb.databaseName
    }

    // models
    this.models.lots = new LotsModel(mongoClient, modelOptions)
    this.models.slots = new SlotsModel(mongoClient, modelOptions)
    this.models.entryPoints = new EntryPointsModel(mongoClient, modelOptions)
    this.models.vehicles = new VehiclesModel(mongoClient, modelOptions)
    this.models.invoices = new InvoicesModel(mongoClient, modelOptions)

    // controllers
    this.controllers.lot = new LotController({
      lotsModel: this.models.lots,
      entryPointsModel: this.models.entryPoints
    })
    this.controllers.slot = new SlotController({
      lotsModel: this.models.lots,
      slotsModel: this.models.slots,
      entryPointsModel: this.models.entryPoints,
      vehiclesModel: this.models.vehicles,
      invoicesModel: this.models.invoices
    })
    this.controllers.entryPoint = new EntryPointController({
      entryPointsModel: this.models.entryPoints,
      slotsModel: this.models.slots,
      lotsModel: this.models.lots
    })
    this.controllers.invoice = new InvoiceController({
      entryPointsModel: this.models.entryPoints,
      slotsModel: this.models.slots,
      vehiclesModel: this.models.vehicles,
      invoicesModel: this.models.invoices
    })
  }

  async setupDB () {
    this.models.lots.db.createCollection(LotsModel.collectionName)
    this.models.slots.db.createCollection(SlotsModel.collectionName)
    this.models.entryPoints.db.createCollection(EntryPointsModel.collectionName)
    this.models.vehicles.db.createCollection(VehiclesModel.collectionName)
    this.models.invoices.db.createCollection(InvoicesModel.collectionName)
  }

  setupServer () {
    this.setupRoutes()
    this.startListening()
  }

  /**
   * Get route path depending on environment
   */
  getRoutePath () {
    return path.resolve(__dirname, '../', 'lib/routes')
  }

  /**
   * Sets up routes
   */
  setupRoutes () {
    router.setup(this.getRoutePath(), this.router, this)

    this.app.use(bodyParser.json())
    this.app.use(this.router)
    this.app.use(errorHandler)
  }

  startListening () {
    const port = this.config.service.port

    this.app.listen(port)

    console.log(`Server listening on port ${port}`)
  }
}

module.exports = Service
