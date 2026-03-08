import { describe, test, expect } from '@jest/globals';

let ValidationEngine;

beforeAll(async () => {
  const mod = await import('../../src/core/ValidationEngine.js');
  ValidationEngine = mod.ValidationEngine;
});

describe('ValidationEngine - permissions', () => {
  test('accepts valid permission configs', () => {
    expect(() =>
      ValidationEngine.permissions({ printing: 'lowResolution', copying: false }),
    ).not.toThrow();
  });

  test('rejects unknown keys', () => {
    expect(() => ValidationEngine.permissions({ foo: true })).toThrow('Unknown permission');
  });

  test('rejects non-boolean for modifying', () => {
    expect(() => ValidationEngine.permissions({ modifying: 'nope' })).toThrow('boolean');
  });

  test('rejects invalid printing value', () => {
    expect(() => ValidationEngine.permissions({ printing: 'medium' })).toThrow('printing');
  });

  test('rejects non-object', () => {
    expect(() => ValidationEngine.permissions('nope')).toThrow('object');
  });
});

describe('ValidationEngine - text', () => {
  test('accepts valid text', () => {
    expect(() => ValidationEngine.text('hello')).not.toThrow();
  });

  test('rejects empty string', () => {
    expect(() => ValidationEngine.text('')).toThrow('non-empty');
  });

  test('rejects non-string', () => {
    expect(() => ValidationEngine.text(123)).toThrow('non-empty string');
  });

  test('rejects invalid fontSize', () => {
    expect(() => ValidationEngine.text('hi', { fontSize: -1 })).toThrow('positive');
  });
});

describe('ValidationEngine - metadata', () => {
  test('accepts valid metadata', () => {
    expect(() =>
      ValidationEngine.metadata({ title: 'Test', author: 'Me' }),
    ).not.toThrow();
  });

  test('rejects unknown fields', () => {
    expect(() => ValidationEngine.metadata({ foo: 'bar' })).toThrow('Unknown metadata');
  });
});

describe('ValidationEngine - expiration', () => {
  test('accepts future date', () => {
    expect(() => ValidationEngine.expirationDate('2099-12-31')).not.toThrow();
  });

  test('rejects past date', () => {
    expect(() => ValidationEngine.expirationDate('2000-01-01')).toThrow('future');
  });

  test('rejects invalid string', () => {
    expect(() => ValidationEngine.expirationDate('not-a-date')).toThrow('Invalid date');
  });
});

describe('ValidationEngine - tracking', () => {
  test('accepts valid ID', () => {
    expect(() => ValidationEngine.trackingId('USER-123')).not.toThrow();
  });

  test('rejects empty string', () => {
    expect(() => ValidationEngine.trackingId('')).toThrow('non-empty');
  });
});

describe('ValidationEngine - url', () => {
  test('accepts valid URL', () => {
    expect(() => ValidationEngine.url('https://example.com')).not.toThrow();
  });

  test('rejects invalid URL', () => {
    expect(() => ValidationEngine.url('not a url')).toThrow('Invalid URL');
  });
});

describe('ValidationEngine - table', () => {
  test('accepts valid rows', () => {
    expect(() => ValidationEngine.tableData([['a', 'b']])).not.toThrow();
  });

  test('rejects empty array', () => {
    expect(() => ValidationEngine.tableData([])).toThrow('non-empty');
  });

  test('rejects non-array rows', () => {
    expect(() => ValidationEngine.tableData(['not an array'])).toThrow('array');
  });
});
