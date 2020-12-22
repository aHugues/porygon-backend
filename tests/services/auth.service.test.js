const knex = require('../../services/database.service');
const authService = require('../../services/auth.service');

// prevent connection hanging at the end of execution
afterAll(() => knex.destroy());


describe('createUser', () => {
  it('is an observable', () => {
    expect(authService.createUser().subscribe).toBeDefined();
  });

  it('completes when correct values are passed', (done) => {
    const newUser = {
      login: 'test',
      password: 'toto',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@email.com'
    };
    authService.createUser(newUser, 0).subscribe(
      (result) => {
        expect(result.length).toBe(1);
        expect(result[0]).toBe(0);
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when invalid values are passed', (done) => {
    const wrongUser = {
      wrongField: true,
    };
    authService.createUser(wrongUser, 0).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
        expect(error).toBe('Missing field for created user');
        done();
      },
    );
  });
});


describe('checkLogin', () => {
    it('is an observable', () => {
      expect(authService.checkLogin().subscribe).toBeDefined();
    });
  
    it('completes with user info when the correct password is passed', (done) => {
      authService.checkLogin('test', 'toto', 0).subscribe(
        (result) => {
          expect(result).toStrictEqual({'login': 'test', 'firstName': 'John', 'lastName': 'Doe', 'email': 'test@email.com'});
        },
        (error) => expect(error).not.toBeDefined(),
        () => done(),
      );
    });
  
    it('fails when the wrong password is passed', (done) => {
        authService.checkLogin('test', 'tata', 0).subscribe(
          (result) => expect(result).not.toBeDefined(),
          (error) => {
              expect(typeof error).toBe('object');
              expect(error.name).toBe('Error');
              expect(error.message).toBe('Invalid password for user test.');
              expect(error.statusCode).toBe(401);
              done();
          },
        );
      });

    it('fails when the user is not found', (done) => {
      authService.checkLogin('notfound', 'toto', 0).subscribe(
        (result) => expect(result).not.toBeDefined(),
        (error) => {
            expect(typeof error).toBe('object');
            expect(error.name).toBe('Error');
            expect(error.message).toBe('User with login notfound not found.');
            expect(error.statusCode).toBe(404);
            done();
        },
      );
    });
  });


describe('getUserInfo', () => {
  it('is an observable', () => {
    expect(authService.getUserInfo().subscribe).toBeDefined();
  });

  it('gives the information for a known user', (done) => {
    authService.getUserInfo('user1').subscribe(
      (result) => {
        expect(result).toStrictEqual({"email": "user1@email.com", "firstName": "User", "lastName": "One", "login": "user1"});
      },
      (error) => expect(error).not.toBeDefined(),
      () => done(),
    );
  });

  it('fails when the user is not found', (done) => {
    authService.getUserInfo('notfound', 'toto', 0).subscribe(
      (result) => expect(result).not.toBeDefined(),
      (error) => {
          expect(typeof error).toBe('object');
          expect(error.name).toBe('Error');
          expect(error.message).toBe('User with login notfound not found.');
          expect(error.statusCode).toBe(404);
          done();
      },
    );
  });
});
