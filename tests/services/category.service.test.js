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

  it('gets the expected elements from the database', (done) => {
    const baseQuery = {
      attributes: '',
    };
    categoriesService.getAllCategories(baseQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('selects the required fields as expected', (done) => {
    const filterQuery = {
      attributes: 'label,id',
    };
    categoriesService.getAllCategories(filterQuery).subscribe(
      (result) => {
        expect(result.length).toBe(2);
        result.forEach((category) => {
          expect(category.label).toBeDefined();
          expect(category.id).toBeDefined();
          expect(category.description).not.toBeDefined();
        });
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly search the requested values', (done) => {
    const searchQuery = {
      attributes: '',
      label: '2',
    };
    categoriesService.getAllCategories(searchQuery).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0].label).toBe('test category 2');
        expect(result[0].id).toBe(2);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly orders the values by asc order', (done) => {
    const orderQuery = {
      attributes: '',
      sort: 'description',
    };
    categoriesService.getAllCategories(orderQuery).subscribe(
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
      sort: '-label',
    };
    categoriesService.getAllCategories(orderQuery).subscribe(
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
    categoriesService.getAllCategories(erroredQuery).subscribe(
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


describe('getCategoryById', () => {
  it('is an observable', () => {
    expect(categoriesService.getCategoryById(1).subscribe).toBeDefined();
  });

  it('correctly returns the expected category', (done) => {
    categoriesService.getCategoryById(1).subscribe(
      (result) => {
        expect(result[0].id).toBe(1);
        expect(result[0].label).toBe('test category 1');
        expect(result[0].description).toBe('2- this is a first test category.');
        done();
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('correctly catches error when unknown category', (done) => {
    categoriesService.getCategoryById(3).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(error.message).toContain('Category with id 3 not found.');
        done();
      },
    );
  });
});


describe('createCategory', () => {
  afterAll(async (done) => {
    await knex('Category').where('id', 3).delete();
    done();
  });

  it('is an observable', () => {
    expect(categoriesService.createCategory().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const newCategory = {
      label: 'test new category',
      description: 'test new description',
    };
    categoriesService.createCategory(newCategory).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(3);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongCategory = {
      wrongField: true,
    };
    categoriesService.createCategory(wrongCategory).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.status).toBe(400);
        expect(error.message).toBe("Unauthorized field 'wrongField' in query");
        done();
      },
    );
  });
});


describe('updateCategory', () => {
  beforeAll(async (done) => {
    const sampleCategory = {
      label: 'test new category',
      description: 'test new description',
    };
    await knex('Category').insert([sampleCategory]);
    done();
  });
  afterAll(async (done) => {
    await knex('Category').where('id', 4).delete();
    done();
  });

  it('is an observable', () => {
    expect(categoriesService.updateCategory().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const updatedCategory = {
      label: 'updated new category',
    };
    categoriesService.updateCategory(4, updatedCategory).subscribe(
      (result) => expect(result).toBe(true),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly updated the values', (done) => {
    knex('Category').where('id', 4).select()
      .then((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(4);
        expect(result[0].label).toBe('updated new category');
        expect(result[0].description).toBe('test new description');
        done();
      });
  });

  it('knows when id has not been found', (done) => {
    const updatedCategory = {
      label: 'updated new category',
    };
    categoriesService.updateCategory(5, updatedCategory).subscribe(
      (result) => expect(result).toBe(false),
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongCategory = {
      wrongField: true,
    };
    categoriesService.updateCategory(4, wrongCategory).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(typeof error).toBe('object');
        expect(error.status).toBe(400);
        expect(error.message).toBe("Unauthorized field 'wrongField' in query");
        done();
      },
    );
  });
});


describe('deleteCategory', () => {
  beforeAll(async (done) => {
    const sampleCategory = {
      label: 'test new category',
      description: 'test new description',
    };
    await knex('Category').insert([sampleCategory]);
    done();
  });
  afterAll(async (done) => {
    await knex('Category').where('id', 5).delete();
    done();
  });

  it('is an observable', () => {
    expect(categoriesService.deleteCategory().subscribe).toBeDefined();
  });

  it('has the expected data', (done) => {
    knex('Category').where('id', 5).select()
      .then((result) => {
        expect(result.length).toBe(1);
        done();
      });
  });

  it('completes when correct values are passed', (done) => {
    categoriesService.deleteCategory(5).subscribe(
      () => {},
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('has correctly deleted the element', (done) => {
    knex('Category').where('id', 5).select()
      .then((result) => {
        expect(result.length).toBe(0);
        done();
      });
  });

  it('fails when no values are passed', (done) => {
    categoriesService.deleteCategory().subscribe(
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
