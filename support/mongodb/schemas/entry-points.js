'use strict'

exports.EntryPoints = {
  type: 'object',
  properties: {
    _id: {
      type: 'objectId',
      description: 'Entry point Id'
    },
    lotId: {
      type: 'objectId',
      description: 'Id of the lot it belongs to'
    },
    name: {
      type: 'string',
      description: 'Name of the entry point'
    },
    createdAt: {
      type: 'string',
      description: 'Date when the slot was created'
    },
    updatedAt: {
      type: 'string',
      description: 'Date when the slot was last updated'
    }
  },
  required: [
    '_id',
    'lotId',
    'name',
    'createdAt',
    'updatedAt'
  ]
}