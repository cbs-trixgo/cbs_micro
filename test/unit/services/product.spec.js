'use strict'

const { ServiceBroker, Context } = require('moleculer')
const { ValidationError } = require('moleculer').Errors
const ProductService = require('../../../services/product/product.service')

describe("Test 'PRODUCT' service", () => {
    const broker = new ServiceBroker({ logger: false })
    const service = broker.createService(ProductService)
    beforeAll(() => broker.start())
    afterAll(() => broker.stop())

    // Test get list categories
    describe("Test 'products.ACT_PRODUCTS_GET_LIST' action", () => {
        it('should return object include error, message and data', async () => {
            const res = await broker.call('products.ACT_PRODUCTS_GET_LIST')
            expect(res).toEqual({
                error: expect.any(Boolean),
                message: 'get_list_products_success',
                data: expect.any(Object),
            })
        })
    })
})
