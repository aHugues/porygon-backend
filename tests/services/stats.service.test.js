const knex = require('../../services/database.service');
const statsService = require('../../services/stats.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());

describe('countMoviesByYear', () => {
  it('Gets the expected results', async () => {
    const result = await statsService.countMoviesByYear();
    expect(result).toEqual([
      { year: 2005, movie_count: 1 },
      { year: 2019, movie_count: 2 },
    ]);
  });
});


describe('countSeriesByYear', () => {
  it('Gets the expected results', async () => {
    const result = await statsService.countSeriesByYear();
    expect(result).toEqual([
      { year: 2013, serie_count: 2 },
      { year: 2019, serie_count: 1 },
    ]);
  });
});


describe('getFullStats', () => {
  it('Gets the expected results', async () => {
    const result = await statsService.getFullStats();
    expect(result).toEqual({
      movie_count: 3,
      serie_count: 3,
      category_count: 2,
      location_count: 3,
    });
  });
});
