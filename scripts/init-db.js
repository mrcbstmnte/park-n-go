'use strict'

const config = require('@config')

const Service = require('@/lib/service')

const service = new Service(config);

(async function () {
  await service.setupDependencies()
  await service.setupDB()
})()
