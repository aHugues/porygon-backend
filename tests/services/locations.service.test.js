const knex = require('../../services/database.service');
const locationsService = require('../../services/locations.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());

describe('getAllLocations', () => {
  it('gets the expected elements from the database', async () => {
    const result = await locationsService.getAllLocations();
    expect(result.length).toBe(2);
  });
});

describe('getLocationById', () => {
  it('correctly returns the expected location', async () => {
    const result = await locationsService.getLocationById(1);
    expect(result[0].id).toBe(1);
    expect(result[0].location).toBe('test location 1');
    expect(result[0].is_physical).toBe(1);
  });

  it('correctly catches error when unknown location', async () => {
    try {
      const result = await locationsService.getLocationById(3);
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(error.message).toContain('Location with id 3 not found.');
    }
  });
});

describe('createLocation', () => {
  afterAll(async (done) => {
    await knex('Location').where('id', 3).delete();
    done();
  });

  it('completes when correct values are passed', async () => {
    const newLocation = {
      location: 'test new location',
      is_physical: true,
    };
    const result = await locationsService.createLocation(newLocation);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(3);
  });

  it('fails when invalid values are passed', async () => {
    const wrongLocation = {
      wrongField: true,
    };
    try {
      const result = await locationsService.createLocation(wrongLocation);
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(typeof error).toBe('object');
      expect(error.status).toBe(400);
      expect(error.message).toBe("Unauthorized field 'wrongField' in query");
    }
  });
});

describe('updateLocation', () => {
  beforeAll(async (done) => {
    const sampleLocation = {
      location: 'test new location',
      is_physical: true,
    };
    await knex('Location').insert([sampleLocation]);
    done();
  });
  afterAll(async (done) => {
    await knex('Location').where('id', 4).delete();
    done();
  });

  it('completes when correct values are passed', async () => {
    const updatedLocation = {
      location: 'updated new location',
    };
    const result = await locationsService.updateLocation(4, updatedLocation);
    expect(result).toBe(true);
  });

  it('has correctly updated the values', async () => {
    const result = await knex('Location').where('id', 4).select();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(4);
    expect(result[0].location).toBe('updated new location');
    expect(result[0].is_physical).toBe(1);
  });

  it('knows when id has not been found', async () => {
    const updatedLocation = {
      location: 'updated new location',
    };
    const result = await locationsService.updateLocation(5, updatedLocation);
    expect(result).toBe(false);
  });

  it('fails when invalid values are passed', async () => {
    const wrongLocation = {
      wrongField: true,
    };
    try {
      const result = await locationsService.updateLocation(4, wrongLocation);
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(typeof error).toBe('object');
      expect(error.status).toBe(400);
      expect(error.message).toBe("Unauthorized field 'wrongField' in query");
    }
  });
});

describe('deleteLocation', () => {
  beforeAll(async (done) => {
    const sampleLocation = {
      location: 'test new location',
      is_physical: true,
    };
    await knex('Location').insert([sampleLocation]);
    done();
  });
  afterAll(async (done) => {
    await knex('Location').where('id', 5).delete();
    done();
  });

  it('has the expected data', async () => {
    const result = await knex('Location').where('id', 5).select();
    expect(result.length).toBe(1);
  });

  it('completes when correct values are passed', async () => {
    await locationsService.deleteLocation(5);
  });

  it('has correctly deleted the element', async () => {
    const result = await knex('Location').where('id', 5).select();
    expect(result.length).toBe(0);
  });

  it('fails when no values are passed', async () => {
    try {
      const result = await locationsService.deleteLocation();
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(typeof error).toBe('object');
      expect(error.name).toBe('Error');
      expect(error.message).toContain('Undefined binding(s) detected');
    }
  });
});

describe('countForLocation', () => {
  it('does not fail on unknown location', async () => {
    const result = await locationsService.countForLocation(-1);
    expect(result).toEqual({
      movies: 0,
      series: 0,
    });
  });

  it('correctly counts on known location', async () => {
    const result = await locationsService.countForLocation(1);
    expect(result).toEqual({
      movies: 2,
      series: 2,
    });
  });
});
