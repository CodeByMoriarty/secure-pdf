import { describe, test, expect } from '@jest/globals';

let computeContentHash, verifyContentHash, sha256, hmacSha256, constantTimeCompare;

beforeAll(async () => {
  const tamper = await import('../../src/features/tamper-detection.js');
  const crypto = await import('../../src/utils/crypto.js');
  computeContentHash = tamper.computeContentHash;
  verifyContentHash = tamper.verifyContentHash;
  sha256 = crypto.sha256;
  hmacSha256 = crypto.hmacSha256;
  constantTimeCompare = crypto.constantTimeCompare;
});

describe('tamper detection', () => {
  test('computeContentHash is deterministic', () => {
    const a = computeContentHash(['hello', 'world'], 'salt');
    const b = computeContentHash(['hello', 'world'], 'salt');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  test('hash changes with different content', () => {
    const a = computeContentHash(['hello'], 'salt');
    const b = computeContentHash(['world'], 'salt');
    expect(a).not.toBe(b);
  });

  test('hash changes with different salt', () => {
    const a = computeContentHash(['same'], 'salt1');
    const b = computeContentHash(['same'], 'salt2');
    expect(a).not.toBe(b);
  });

  test('verifyContentHash returns valid on match', () => {
    const hash = computeContentHash(['test'], 'key');
    const result = verifyContentHash(hash, ['test'], 'key');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('verified');
  });

  test('verifyContentHash returns invalid on mismatch', () => {
    const hash = computeContentHash(['original'], 'key');
    const result = verifyContentHash(hash, ['modified'], 'key');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('tampered');
  });
});

describe('crypto utilities', () => {
  test('sha256 produces 64-char hex', () => {
    expect(sha256('hello')).toMatch(/^[a-f0-9]{64}$/);
  });

  test('sha256 is deterministic', () => {
    expect(sha256('test')).toBe(sha256('test'));
  });

  test('hmacSha256 produces 64-char hex', () => {
    expect(hmacSha256('key', 'data')).toMatch(/^[a-f0-9]{64}$/);
  });

  test('hmacSha256 is deterministic', () => {
    expect(hmacSha256('k', 'd')).toBe(hmacSha256('k', 'd'));
  });

  test('hmacSha256 changes with different key', () => {
    expect(hmacSha256('k1', 'data')).not.toBe(hmacSha256('k2', 'data'));
  });

  test('constantTimeCompare returns true for equal strings', () => {
    expect(constantTimeCompare('abc', 'abc')).toBe(true);
  });

  test('constantTimeCompare returns false for different strings', () => {
    expect(constantTimeCompare('abc', 'xyz')).toBe(false);
  });

  test('constantTimeCompare returns false for different lengths', () => {
    expect(constantTimeCompare('abc', 'abcd')).toBe(false);
  });

  test('constantTimeCompare rejects non-strings', () => {
    expect(constantTimeCompare(123, 123)).toBe(false);
  });
});
