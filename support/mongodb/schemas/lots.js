'use strict'

exports.Lots = {
  type: 'object',
  properties: {
    _id: {
      type: 'objectId',
      description: 'Parking lot Id'
    },
    name: {
      type: 'string',
      description: 'Parking lot name'
    },
    entryPoints: {
      type: 'integer',
      description: 'Number of entry points the parking lot have',
      default: 3
    },
    createdAt: {
      type: 'string',
      description: 'Date when the lot was created'
    },
    updatedAt: {
      type: 'string',
      description: 'Date when the lot was last updated'
    }
  },
  required: [
    '_id',
    'name',
    'entryPoints',
    'createdAt',
    'updatedAt'
  ]
}
