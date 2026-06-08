import { brazeCallback, callFunctionWithCallback, parseNestedProperties } from '../src/helpers';

const testCallback = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe('Helper functions', () => {
  describe('brazeCallback', () => {
    test('logs error when error is provided', () => {
      const error = new Error('Test error');
      console.log = jest.fn();
      brazeCallback(error, null);
      expect(console.log).toHaveBeenCalledWith(error);
    });

    test('logs null result message when result is null', () => {
      console.log = jest.fn();
      brazeCallback(null, null);
      expect(console.log).toHaveBeenCalledWith('Braze API method returned null or false.');
    });

    test('logs false result message when result is false', () => {
      console.log = jest.fn();
      brazeCallback(null, false);
      expect(console.log).toHaveBeenCalledWith('Braze API method returned null or false.');
    });

    describe.each([
      ['valid string', 'valid_result'],
      ['zero', 0],
      ['empty string', ''],
    ])('does not log when error is null and result is %s', (_, result) => {
      const consoleSpy = jest.fn();
      const originalLog = console.log;
      console.log = consoleSpy;

      brazeCallback(null, result);

      expect(consoleSpy).not.toHaveBeenCalled();
      console.log = originalLog;
    });
  });

  describe('callFunctionWithCallback', () => {
    test('calls method with provided callback', () => {
      const mockMethod = jest.fn();
      const mockCallback = jest.fn();

      callFunctionWithCallback(mockMethod, ['arg1', 'arg2'], mockCallback);

      expect(mockMethod).toHaveBeenCalledWith('arg1', 'arg2', mockCallback);
    });

    describe.each([
      ['null', null],
      ['undefined', undefined],
      ['non-function', 'not_a_function'],
    ])('calls method with default callback when callback is %s', (_, callback) => {
      const mockMethod = jest.fn();

      callFunctionWithCallback(mockMethod, ['arg1', 'arg2'], callback);

      expect(mockMethod).toHaveBeenCalledWith('arg1', 'arg2', brazeCallback);
    });

    test('calls method with empty args array', () => {
      const mockMethod = jest.fn();
      const mockCallback = jest.fn();

      callFunctionWithCallback(mockMethod, [], mockCallback);

      expect(mockMethod).toHaveBeenCalledWith(mockCallback);
    });
  });

  describe('parseNestedProperties', () => {
    test('converts Date in object to UNIX timestamp', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const obj = { dateField: date };

      parseNestedProperties(obj);

      expect(obj.dateField).toEqual({
        type: 'UNIX_timestamp',
        value: date.valueOf()
      });
    });

    test('converts Date in array to UNIX timestamp', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const arr = [date];

      parseNestedProperties(arr);

      expect(arr[0]).toEqual({
        type: 'UNIX_timestamp',
        value: date.valueOf()
      });
    });

    test('converts nested Dates in nested objects', () => {
      const date1 = new Date('2023-01-01T00:00:00Z');
      const date2 = new Date('2023-12-31T23:59:59Z');
      const obj = {
        nested: {
          dateField1: date1
        },
        dateField2: date2
      };

      parseNestedProperties(obj);

      expect(obj.nested.dateField1).toEqual({
        type: 'UNIX_timestamp',
        value: date1.valueOf()
      });
      expect(obj.dateField2).toEqual({
        type: 'UNIX_timestamp',
        value: date2.valueOf()
      });
    });

    test('converts Dates in array of objects', () => {
      const date1 = new Date('2023-01-01T00:00:00Z');
      const date2 = new Date('2023-12-31T23:59:59Z');
      const arr = [
        { dateField: date1 },
        { dateField: date2 }
      ];

      parseNestedProperties(arr);

      expect(arr[0].dateField).toEqual({
        type: 'UNIX_timestamp',
        value: date1.valueOf()
      });
      expect(arr[1].dateField).toEqual({
        type: 'UNIX_timestamp',
        value: date2.valueOf()
      });
    });

    test('leaves non-Date values unchanged', () => {
      const obj = {
        stringField: 'value',
        numberField: 42,
        booleanField: true,
        nullField: null
      };

      parseNestedProperties(obj);

      expect(obj.stringField).toBe('value');
      expect(obj.numberField).toBe(42);
      expect(obj.booleanField).toBe(true);
      expect(obj.nullField).toBe(null);
    });

    test('handles mixed Date and non-Date values', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const obj = {
        stringField: 'value',
        dateField: date,
        numberField: 42
      };

      parseNestedProperties(obj);

      expect(obj.stringField).toBe('value');
      expect(obj.dateField).toEqual({
        type: 'UNIX_timestamp',
        value: date.valueOf()
      });
      expect(obj.numberField).toBe(42);
    });

    test('handles deeply nested structures', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const obj = {
        level1: {
          level2: {
            level3: {
              dateField: date
            }
          }
        }
      };

      parseNestedProperties(obj);

      expect(obj.level1.level2.level3.dateField).toEqual({
        type: 'UNIX_timestamp',
        value: date.valueOf()
      });
    });

    test('handles empty objects and arrays', () => {
      const obj = {};
      const arr = [];

      parseNestedProperties(obj);
      parseNestedProperties(arr);

      expect(obj).toEqual({});
      expect(arr).toEqual([]);
    });

    test('handles null input gracefully', () => {
      expect(() => parseNestedProperties(null)).not.toThrow();
    });
  });
});
