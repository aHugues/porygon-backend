const knex = require('../../services/database.service');
const locationsService = require('../../services/locations.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());

describe('getAllLocations', () => {
  it('is an observable', () => {
    const baseQuery = {
      attributes: '',
    };
    expect(locationsService.getAllLocations(baseQuery).subscribe).toBeDefined();
  });

  it('gets the expected elements from the database', (done) => {
    const baseQuery = {
      attributes: '',
    };
    locationsService.getAllLocations(baseQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('selects the required fields as expected', (done) => {
    const filterQuery = {
      attributes: 'location,id',
    };
    locationsService.getAllLocations(filterQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
        result.forEach((location) => {
          expect(location.location).toBeDefined();
          expect(location.id).toBeDefined();
          expect(location.is_physical).not.toBeDefined();
        });
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly search the requested values', (done) => {
    const searchQuery = {
      attributes: '',
      location: '2',
    };
    locationsService.getAllLocations(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0].location).toBe('test location 2');
        expect(result[0].id).toBe(2);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by asc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: 'is_physical',
    };
    locationsService.getAllLocations(orderQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
        expect(result[0].id).toBe(2);
        expect(result[1].id).toBe(1);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by desc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: '-location',
    };
    locationsService.getAllLocations(orderQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
        expect(result[0].id).toBe(2);
        expect(result[1].id).toBe(1);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches errors', (done) => {
    const erroredQuery = {
      attributes: 'unknown',
    };
    locationsService.getAllLocations(erroredQuery).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.name).toBe('Error');
        expect(error.message).toContain('ER_BAD_FIELD_ERROR');
        done();
      },
    );
  });
});

describe('getLocationById', () => {
  it('is an observable', () => {
    expect(locationsService.getLocationById(1).subscribe).toBeDefined();
  });

  it('correctly returns the expected location', (done) => {
    locationsService.getLocationById(1).subscribe(
      (result) => {
        expect(result[0].id).toBe(1);
        expect(result[0].location).toBe('test location 1');
        expect(result[0].is_physical).toBe(1);
        done();
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches error when unknown location', (done) => {
    locationsService.getLocationById(3).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(error.message).toContain('Location with id 3 not found.');
        done();
      },
    );
  });
});

describe('createLocation', () => {
  afterAll(async (done) => {
    await knex('Location').where('id', 3).delete();
    done();
  });

  it('is an observable', () => {
    expect(locationsService.createLocation().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const newLocation = {
      location: 'test new location',
      is_physical: true,
    };
    locationsService.createLocation(newLocation).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongLocation = {
      wrongField: true,
    };
    locationsService.createLocation(wrongLocation).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.name).toBe('Error');
        expect(error.message).toContain('ER_BAD_FIELD_ERROR');
        done();
      },
    );
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

  it('is an observable', () => {
    expect(locationsService.updateLocation().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const updatedLocation = {
      location: 'updated new location',
    };
    locationsService.updateLocation(4, updatedLocation).subscribe(
      (result) => expect(result).toBe(true),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly updated the values', (done) => {
    knex('Location').where('id', 4).select()
      .then((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(4);
        expect(result[0].location).toBe('updated new location');
        expect(result[0].is_physical).toBe(1);
        done();
      });
  });

  it('knows when id has not been found', (done) => {
    const updatedLocation = {
      location: 'updated new location',
    };
    locationsService.updateLocation(5, updatedLocation).subscribe(
      (result) => expect(result).toBe(false),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongLocation = {
      wrongField: true,
    };
    locationsService.updateLocation(4, wrongLocation).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.name).toBe('Error');
        expect(error.message).toContain('ER_BAD_FIELD_ERROR');
        done();
      },
    );
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

  it('is an observable', () => {
    expect(locationsService.deleteLocation().subscribe).toBeDefined();
  });

  it('has the expected data', (done) => {
    knex('Location').where('id', 5).select()
      .then((result) => {
        expect(result.length).toBe(1);
        done();
      });
  });

  it('completes when correct values are passed', (done) => {
    locationsService.deleteLocation(5).subscribe(
      () => {},
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly deleted the element', (done) => {
    knex('Location').where('id', 5).select()
      .then((result) => {
        expect(result.length).toBe(0);
        done();
      });
  });

  it('fails when no values are passed', (done) => {
    locationsService.deleteLocation().subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.name).toBe('Error');
        expect(error.message).toContain('Undefined binding(s) detected');
        done();
      },
    );
  });
});

describe('countForLocation', () => {
  it('is an observable', () => {
    expect(locationsService.countForLocation().subscribe).toBeDefined();
  });

  it('does not fail on unknown location', (done) => {
    locationsService.countForLocation(-1).subscribe(
      (result) => {
        expect(result[1]).toBe(0);
        expect(['movies', 'series']).toContain(result[0]);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly counts on known location', (done) => {
    locationsService.countForLocation(1).subscribe(
      (result) => {
        expect(['movies', 'series']).toContain(result[0]);
        if (result[0] === 'movies') {
          expect(result[1]).toBe(2);
        } else {
          expect(result[1]).toBe(0);
        }
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });
});
