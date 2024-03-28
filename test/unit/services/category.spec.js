"use strict";

const { ServiceBroker, Context } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const CategoryService = require("../../../services/category/category.service");

describe("Test 'category' service", () => {

    const broker = new ServiceBroker({ logger: false });
	const service = broker.createService(CategoryService);
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	// Test get list categories
	describe("Test 'categories.ACT_CATEGORIES_GETLIST' action", () => {
		it("should return object include error, message and data", async () => {

            const res = await broker.call("categories.ACT_CATEGORIES_GETLIST");
			expect(res).toEqual({
				error: expect.any(Boolean),
				message: 'get_list_categories_success',
				data: expect.any(Object),
			});
		});
	});	
	
});
