const knex = require('../../services/database.service');
const moviesService = require('../../services/movies.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());

describe('getAllMovies', () => {
  it('is an observable', () => {
    const baseQuery = {
      attributes: '',
    };
    expect(moviesService.getAllMovies(baseQuery).subscribe).toBeDefined();
  });

  it('gets the expected elements from the database', (done) => {
    const baseQuery = {
      attributes: '',
    };
    moviesService.getAllMovies(baseQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('selects the required fields as expected', (done) => {
    const filterQuery = {
      attributes: 'title,Movie.id',
    };
    moviesService.getAllMovies(filterQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
        result.forEach((movie) => {
          expect(movie.Movie.title).toBeDefined();
          expect(movie.Movie.id).toBeDefined();
          expect(movie.Movieremarks).not.toBeDefined();
          expect(movie.Movie.director).not.toBeDefined();
          expect(movie.Movie.category_id).not.toBeDefined();
        });
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly search the requested values', (done) => {
    const searchQuery = {
      attributes: '',
      title: '2',
    };
    moviesService.getAllMovies(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0].Movie.title).toBe('test Movie 2');
        expect(result[0].Movie.id).toBe(2);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly limits the results', (done) => {
    const searchQuery = {
      attributes: '',
      limit: 1,
    };
    moviesService.getAllMovies(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0].Movie.id).toBe(1);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly offsets the results', (done) => {
    const searchQuery = {
      attributes: '',
      offset: 1,
    };
    moviesService.getAllMovies(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
        expect(result[0].Movie.id).toBe(2);
        expect(result[1].Movie.id).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by asc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: 'remarks',
    };
    moviesService.getAllMovies(orderQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
        expect(result[0].Movie.id).toBe(3);
        expect(result[1].Movie.id).toBe(2);
        expect(result[2].Movie.id).toBe(1);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by desc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: '-location_id',
    };
    moviesService.getAllMovies(orderQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
        expect(result[0].Movie.id).toBe(2);
        expect(result[1].Movie.id).toBe(1);
        expect(result[2].Movie.id).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches errors', (done) => {
    const erroredQuery = {
      attributes: 'unknown',
    };
    moviesService.getAllMovies(erroredQuery).subscribe(
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


describe('getMovieById', () => {
  it('is an observable', () => {
    expect(moviesService.getMovieById(1).subscribe).toBeDefined();
  });

  it('correctly returns the expected movie', (done) => {
    moviesService.getMovieById(1).subscribe(
      (result) => {
        expect(result.id).toBe(1);
        expect(result.title).toBe('test Movie 1');
        expect(result.year).toBe(2019);
        done();
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches error when unknown movie', (done) => {
    moviesService.getMovieById(4).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(error.message).toContain('Movie with id 4 not found.');
        done();
      },
    );
  });
});
