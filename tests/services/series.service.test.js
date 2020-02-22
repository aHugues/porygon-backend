const knex = require('../../services/database.service');
const seriesService = require('../../services/series.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());

describe('getAllSeries', () => {
  it('is an observable', () => {
    const baseQuery = {
      attributes: '',
    };
    expect(seriesService.getAllSeries(baseQuery).subscribe).toBeDefined();
  });

  it('gets the expected elements from the database', (done) => {
    const baseQuery = {
      attributes: '',
    };
    seriesService.getAllSeries(baseQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('selects the required fields as expected', (done) => {
    const filterQuery = {
      attributes: 'title,Serie.id',
    };
    seriesService.getAllSeries(filterQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
        result.forEach((serie) => {
          expect(serie.Serie.title).toBeDefined();
          expect(serie.Serie.id).toBeDefined();
          expect(serie.Serie.remarks).not.toBeDefined();
          expect(serie.Serie.episodes).not.toBeDefined();
          expect(serie.Serie.category_id).not.toBeDefined();
          expect(serie.Serie.year).not.toBeDefined();
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
    seriesService.getAllSeries(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0].Serie.title).toBe('test Serie 2');
        expect(result[0].Serie.id).toBe(3);
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
    seriesService.getAllSeries(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0].Serie.id).toBe(1);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by asc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: 'season',
    };
    seriesService.getAllSeries(orderQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
        expect(result[0].Serie.id).toBe(3);
        expect(result[1].Serie.id).toBe(1);
        expect(result[2].Serie.id).toBe(2);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by desc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: '-remarks',
    };
    seriesService.getAllSeries(orderQuery).subscribe(
      (result) => {
        expect(result.length).toBe(3);
        expect(result[0].Serie.id).toBe(1);
        expect(result[1].Serie.id).toBe(2);
        expect(result[2].Serie.id).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches errors', (done) => {
    const erroredQuery = {
      attributes: 'unknown',
    };
    seriesService.getAllSeries(erroredQuery).subscribe(
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


describe('getSerieById', () => {
  it('is an observable', () => {
    expect(seriesService.getSerieById(1).subscribe).toBeDefined();
  });

  it('correctly returns the expected serie', (done) => {
    seriesService.getSerieById(1).subscribe(
      (result) => {
        expect(result.id).toBe(1);
        expect(result.title).toBe('test Serie 1');
        expect(result.season).toBe(1);
        expect(result.year).toBe(2013);
        done();
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches error when unknown serie', (done) => {
    seriesService.getSerieById(4).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(error.message).toContain('Serie with id 4 not found.');
        done();
      },
    );
  });
});

describe('createSerie', () => {
  afterAll(async (done) => {
    await knex('Serie').where('id', 4).delete();
    await knex('Serie').where('id', 5).delete();
    await knex('Serie').where('id', 6).delete();
    done();
  });

  it('is an observable', () => {
    expect(seriesService.createSerie().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const newSerie = {
      location_id: 1,
      title: 'Test serie',
      remarks: 'This is a test',
      is_bluray: 1,
      season: 1,
      episodes: 42,
      year: 2019,
    };
    seriesService.createSerie(newSerie).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(4);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('completes when categories are passed', (done) => {
    const newSerie = {
      location_id: 1,
      title: 'Test serie',
      remarks: 'This is a test',
      is_bluray: 1,
      season: 1,
      episodes: 42,
      year: 2019,
      categories: [1, 2],
    };
    seriesService.createSerie(newSerie).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(5);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongSerie = {
      wrongField: true,
    };
    seriesService.createSerie(wrongSerie).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.status).toBe(400);
        expect(error.message).toBe("Unauthorized field 'wrongField' in query");
        done();
      },
    );
  });

  it('fails when invalid categories are passed', (done) => {
    const wrongSerie = {
      location_id: 1,
      title: 'Test serie',
      remarks: 'This is a test',
      is_bluray: 1,
      season: 1,
      episodes: 42,
      year: 2019,
      categories: [{ toto: 'tata' }],
    };
    seriesService.createSerie(wrongSerie).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(6);
      },
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.code).toBe('ER_BAD_FIELD_ERROR');
        expect(error.sqlMessage).toBe("Unknown column 'toto' in 'field list'");
        done();
      },
    );
  });
});


describe('updateSerie', () => {
  beforeAll(async (done) => {
    const sampleSerie = {
      location_id: 1,
      title: 'Test serie',
      remarks: 'This is a test',
      is_bluray: 1,
      season: 1,
      episodes: 42,
      year: 2019,
    };
    await knex('Serie').insert([sampleSerie]);
    done();
  });
  afterAll(async (done) => {
    await knex('Serie').where('id', 7).delete();
    done();
  });

  it('is an observable', () => {
    expect(seriesService.updateSerie().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const updatedSerie = {
      title: 'updated new title',
      is_digital: 1,
    };
    seriesService.updateSerie(7, updatedSerie).subscribe(
      (result) => expect(result).toBe(true),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly updated the values', (done) => {
    knex('Serie').where('id', 7).select()
      .then((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(7);
        expect(result[0].title).toBe('updated new title');
        expect(result[0].remarks).toBe('This is a test');
        expect(result[0].is_digital).toBe(1);
        expect(result[0].is_bluray).toBe(1);
        expect(result[0].is_dvd).toBe(0);
        expect(result[0].season).toBe(1);
        expect(result[0].episodes).toBe(42);
        expect(result[0].year).toBe(2019);
        done();
      });
  });

  it('completes when categories are passed', (done) => {
    const updatedSerie = {
      title: 'updated new title',
      is_digital: 1,
      categories: [1, 2],
    };
    seriesService.updateSerie(7, updatedSerie).subscribe(
      (result) => expect(result).toBe(true),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly updated the categories', (done) => {
    knex('SerieCategoryMapping').where('serieId', 7).select()
      .then((result) => {
        expect(result.length).toBe(2);
        expect(result[0].categoryId).toBe(1);
        expect(result[1].categoryId).toBe(2);
        done();
      });
  });

  it('knows when id has not been found', (done) => {
    const updatedSerie = {
      title: 'updated new serie',
    };
    seriesService.updateSerie(8, updatedSerie).subscribe(
      (result) => expect(result).toBe(false),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongSerie = {
      wrongField: true,
    };
    seriesService.updateSerie(7, wrongSerie).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.status).toBe(400);
        expect(error.message).toBe("Unauthorized field 'wrongField' in query");
        done();
      },
    );
  });

  it('fails when invalid categories are passed', (done) => {
    const wrongSerie = {
      title: 'yet another update',
      categories: [{ toto: 'tata' }],
    };
    seriesService.updateSerie(7, wrongSerie).subscribe(
      (result) => expect(result).toBe(true),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.code).toBe('ER_BAD_FIELD_ERROR');
        expect(error.sqlMessage).toBe("Unknown column 'toto' in 'field list'");
        done();
      },
    );
  });
});


describe('deleteSerie', () => {
  beforeAll(async (done) => {
    const sampleSerie = {
      location_id: 1,
      title: 'Test serie',
      remarks: 'This is a test',
      is_bluray: 1,
      season: 1,
      episodes: 42,
      year: 2019,
    };
    await knex('Serie').insert([sampleSerie]);
    done();
  });
  afterAll(async (done) => {
    await knex('Serie').where('id', 8).delete();
    done();
  });

  it('is an observable', () => {
    expect(seriesService.deleteSerie().subscribe).toBeDefined();
  });

  it('has the expected data', (done) => {
    knex('Serie').where('id', 8).select()
      .then((result) => {
        expect(result.length).toBe(1);
        done();
      });
  });

  it('completes when correct values are passed', (done) => {
    seriesService.deleteSerie(8).subscribe(
      () => {},
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly deleted the element', (done) => {
    knex('Serie').where('id', 8).select()
      .then((result) => {
        expect(result.length).toBe(0);
        done();
      });
  });

  it('fails when no values are passed', (done) => {
    seriesService.deleteSerie().subscribe(
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


describe('countSeries', () => {
  it('is an observable', () => {
    expect(seriesService.countSeries().subscribe).toBeDefined();
  });

  it('correctly counts all series location', (done) => {
    seriesService.countSeries().subscribe(
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
    seriesService.countSeries('1').subscribe(
      (result) => {
        expect(result.count).toBe(2);
      },
      (error) => {
        expect(error).not.toBeDefined();
        done();
      },
      () => done(),
    );
  });
});
