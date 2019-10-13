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

describe('createMovie', () => {
  afterAll(async (done) => {
    await knex('Movie').where('id', 4).delete();
    done();
  });

  it('is an observable', () => {
    expect(moviesService.createMovie().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const newMovie = {
      location_id: 1,
      title: 'Test movie',
      remarks: 'This is a test',
      is_bluray: 1,
      duration: 42,
    };
    moviesService.createMovie(newMovie).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(4);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongMovie = {
      wrongField: true,
    };
    moviesService.createMovie(wrongMovie).subscribe(
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


describe('updateMovie', () => {
  beforeAll(async (done) => {
    const sampleMovie = {
      location_id: 1,
      title: 'Test movie',
      remarks: 'This is a test',
      is_bluray: 1,
      duration: 42,
    };
    await knex('Movie').insert([sampleMovie]);
    done();
  });
  afterAll(async (done) => {
    await knex('Movie').where('id', 5).delete();
    done();
  });

  it('is an observable', () => {
    expect(moviesService.updateMovie().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const updatedMovie = {
      title: 'updated new title',
      is_digital: 1,
    };
    moviesService.updateMovie(5, updatedMovie).subscribe(
      (result) => expect(result).toBe(true),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly updated the values', (done) => {
    knex('Movie').where('id', 5).select()
      .then((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(5);
        expect(result[0].title).toBe('updated new title');
        expect(result[0].remarks).toBe('This is a test');
        expect(result[0].is_digital).toBe(1);
        expect(result[0].is_bluray).toBe(1);
        expect(result[0].is_dvd).toBe(0);
        done();
      });
  });

  it('knows when id has not been found', (done) => {
    const updatedMovie = {
      title: 'updated new movie',
    };
    moviesService.updateMovie(6, updatedMovie).subscribe(
      (result) => expect(result).toBe(false),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongMovie = {
      wrongField: true,
    };
    moviesService.updateMovie(5, wrongMovie).subscribe(
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


describe('deleteMovie', () => {
  beforeAll(async (done) => {
    const sampleMovie = {
      location_id: 1,
      title: 'Test movie',
      remarks: 'This is a test',
      is_bluray: 1,
      duration: 42,
    };
    await knex('Movie').insert([sampleMovie]);
    done();
  });
  afterAll(async (done) => {
    await knex('Movie').where('id', 6).delete();
    done();
  });

  it('is an observable', () => {
    expect(moviesService.deleteMovie().subscribe).toBeDefined();
  });

  it('has the expected data', (done) => {
    knex('Movie').where('id', 6).select()
      .then((result) => {
        expect(result.length).toBe(1);
        done();
      });
  });

  it('completes when correct values are passed', (done) => {
    moviesService.deleteMovie(6).subscribe(
      () => {},
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly deleted the element', (done) => {
    knex('Movie').where('id', 6).select()
      .then((result) => {
        expect(result.length).toBe(0);
        done();
      });
  });

  it('fails when no values are passed', (done) => {
    moviesService.deleteMovie().subscribe(
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


describe('countMovies', () => {
  it('is an observable', () => {
    expect(moviesService.countMovies().subscribe).toBeDefined();
  });

  it('correctly counts all movies location', (done) => {
    moviesService.countMovies().subscribe(
      (result) => {
        expect(result.count).toBe(3);
      },
      (error) => {
        expect(error).not.toBeDefined();
        done();
      },
      () => done(),
    );
  });

  it('correctly counts when filtering title', (done) => {
    moviesService.countMovies('2').subscribe(
      (result) => {
        expect(result.count).toBe(1);
      },
      (error) => {
        expect(error).not.toBeDefined();
        done();
      },
      () => done(),
    );
  });
});
