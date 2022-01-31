'use strict'

exports.Slots = {
  type: 'object',
  properties: {
    _id: {
      type: 'objectId',
      description: 'Slot Id'
    },
    lotId: {
      type: 'objectId',
      description: 'Id of the lot it belongs to'
    },
    distance: {
      type: 'object',
      description: 'Distance from entry points'
    },
    occupied: {
      type: 'boolean',
      description: 'Flag to determine if the slot is already occupied'
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
    'distance',
    'occupied',
    'createdAt',
    'updatedAt'
  ]
}
