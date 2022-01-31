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
      description: 'Vehicle Identification number',
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
