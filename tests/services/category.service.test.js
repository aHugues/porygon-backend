const knex = require('../../services/database.service');
const categoriesService = require('../../services/categories.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());

describe('getAllCategories', () => {
  it('is an observable', () => {
    const baseQuery = {
      attributes: '',
    };
    expect(categoriesService.getAllCategories(baseQuery).subscribe).toBeDefined();
  });
});
