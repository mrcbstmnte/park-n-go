'use strict'

const formulas = require('@lib/formulas')

describe('Formulas', () => {
  describe('#normal', () => {
    it('should compute the payment for normal usage', () => {
      const payment = formulas.normal(40, 5)

      expect(payment).toEqual(80)
    })

    it('should compute the payment that is within the first hours', () => {
      const payment = formulas.normal(40, 3)

      expect(payment).toEqual(0)
    })
  })

  describe('#full', () => {
    it('should compute the payment for a chunk of 24 hours', () => {
      let payment = formulas.full(40, 24)

      expect(payment).toEqual(5000)

      payment = formulas.full(40, 48)

      expect(payment).toEqual(10000)
    })

    it('should compute the payment for a whole chunk of 24 hours and another extra', () => {
      let payment = formulas.full(40, 28)

      expect(payment).toEqual(5160)

      payment = formulas.full(40, 50)

      expect(payment).toEqual(10080)
    })
  })
})
