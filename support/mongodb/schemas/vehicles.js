'use strict'

exports.Vehicles = {
  type: 'object',
  properties: {
    _id: {
      type: 'objectId',
      description: 'Id of the vehicle'
    },
    vin: {
      type: 'string',
      description: 'Vehicle Identification Number',
      unique: true
    },
    type: {
      type: 'integer',
      enum: [
        0, // Small
        1, // Medium
        2 // Large
      ]
    },
    lastVisit: {
      type: 'object',
      properties: {
        duration: {
          type: 'number',
          description: 'Duration of the last stay on the complex. Always rounded up'
        },
        date: {
          type: 'string',
          description: 'Date when the vehicle last stayed'
        }
      },
      required: [
        'duration',
        'date'
      ]
    },
    createdAt: {
      type: 'string',
      description: 'When the vehicle was created'
    },
    updatedAt: {
      type: 'string',
      description: 'When the vehicle was updated'
    }
  },
  required: [
    '_id',
    'vin',
    'type',
    'createdAt',
    'updatedAt'
  ]
}
