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
    label: {
      type: 'string',
      description: 'Slot label',
      unique: true
    },
    type: {
      type: 'string',
      description: 'Slot type',
      enum: [
        0, // Small
        1, // Medium
        2 // Large
      ]
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
