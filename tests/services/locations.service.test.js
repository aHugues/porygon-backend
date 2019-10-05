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
