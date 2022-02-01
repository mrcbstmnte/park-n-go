'use strict'

exports.Invoices = {
  type: 'object',
  properties: {
    _id: {
      type: 'objectId',
      description: 'Invoice Id'
    },
    slotId: {
      type: 'objectId',
      description: 'Id of the slot the vehicle was assigned'
    },
    vehicleId: {
      type: 'objectId',
      description: 'Id of the vehicle assigned to the slot'
    },
    amount: {
      type: 'integer',
      description: 'Total amount to be paid',
      default: 0
    },
    settled: {
      type: 'boolean',
      description: 'If the amount was already settled',
      default: false
    },
    hourlyRate: {
      type: 'integer',
      description: 'Hourly rate'
    },
    createdAt: {
      type: 'string',
      description: 'Date when the invoice was created'
    },
    updatedAt: {
      type: 'string',
      description: 'Date when the invoice was last updated'
    }
  },
  required: [
    '_id',
    'slotId',
    'vehicleId',
    'amount',
    'settled',
    'hourlyRate',
    'createdAt',
    'updatedAt'
  ]
}
