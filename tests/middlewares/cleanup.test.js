const cleanup = require('../../middlewares/cleanup');

describe('removeNulls', () => {
  it('does not modify correct fields', () => {
    const inputObject = {
      field1: 'value1',
      number1: 42,
      bool1: true,
      emptystr: '',
    };
    const processedObject = cleanup.removeNulls(inputObject);
    expect(processedObject.field1).toBe('value1');
    expect(processedObject.number1).toBe(42);
    expect(processedObject.bool1).toBe(true);
    expect(processedObject.emptystr).toBe('');
  });

  it('removes null and undefined values', () => {
    const inputObject = {
      null1: null,
      undefined1: undefined,
      field1: 'value',
      emptyStr: '',
    };
    const processedObject = cleanup.removeNulls(inputObject);
    const processedKeys = Object.keys(processedObject);
    expect(processedKeys).not.toContain('null1');
    expect(processedKeys).not.toContain('undefined1');
    expect(processedKeys).toContain('field1');
    expect(processedKeys).toContain('emptyStr');
  });

  it('removes empty strings if needed', () => {
    const inputObject = {
      null1: null,
      undefined1: undefined,
      field1: 'value',
      emptyStr: '',
    };
    const processedObject = cleanup.removeNulls(inputObject, true);
    const processedKeys = Object.keys(processedObject);
    expect(processedKeys).not.toContain('null1');
    expect(processedKeys).not.toContain('undefined1');
    expect(processedKeys).toContain('field1');
    expect(processedKeys).not.toContain('emptyStr');
  });
});
