const FieldsVerification = require('../../middlewares/fields_verification');

describe('createErrorInvalidField', () => {
  it('Creates the correct error', () => {
    const fieldError = FieldsVerification.createErrorInvalidField('test');
    const expectedError = {
      message: "Unauthorized field 'test' in query",
      status: 400,
    };
    expect(fieldError).toEqual(expectedError);
  });
});

describe('checkFields', () => {
  const expectedFields = ['field1', 'field2', 'field3'];
  it('Works when all fields are valid', () => {
    const testedFields = {
      field1: 'value1',
      field2: 'value2',
    };
    const [valid, returnedField] = FieldsVerification.checkFields(expectedFields, testedFields);
    expect(valid).toBe(true);
    expect(returnedField).toBe(null);
  });
  it('Detects an invalid field', () => {
    const testedFields = {
      field1: 'value1',
      error: 'error',
    };
    const [valid, returnedField] = FieldsVerification.checkFields(expectedFields, testedFields);
    expect(valid).toBe(false);
    expect(returnedField).toBe('error');
  });
});


describe('checkNewUser', () => {
  it('Works when all necessary fields are provided', () => {
    const user = {
      firstName: 'john',
      lastName: 'doe',
      login: 'toto',
      password: 'bloup',
    }
    expect(FieldsVerification.checkNewUser(user)).toBe(true);
  });
  it('Works even when more fields are provided', () => {
    const user = {
      firstName: 'john',
      lastName: 'doe',
      login: 'toto',
      password: 'bloup',
      email: 'test@email.com'
    }
    expect(FieldsVerification.checkNewUser(user)).toBe(true);
  });
  it('Fails when a necessary field is not provided', () => {
    const user = {
      firstName: 'john',
      lastName: 'doe',
      login: 'toto',
      email: 'test@email.com'
    }
    expect(FieldsVerification.checkNewUser(user)).toBe(false);
  });
});
