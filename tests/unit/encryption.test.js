import { describe, test, expect } from '@jest/globals';

let applyEncryption, buildPermissionFlags;

beforeAll(async () => {
  const enc = await import('../../src/features/encryption.js');
  const perm = await import('../../src/features/permissions.js');
  applyEncryption = enc.applyEncryption;
  buildPermissionFlags = perm.buildPermissionFlags;
});

describe('encryption', () => {
  test('sets user and owner passwords', () => {
    const opts = {};
    applyEncryption(opts, 'secret123');
    expect(opts.userPassword).toBe('secret123');
    expect(typeof opts.ownerPassword).toBe('string');
    expect(opts.ownerPassword.length).toBeGreaterThan(0);
    expect(opts.pdfVersion).toBe(1.7);
  });

  test('owner password is randomly generated', () => {
    const a = {};
    const b = {};
    applyEncryption(a, 'pass');
    applyEncryption(b, 'pass');
    expect(a.ownerPassword).not.toBe(b.ownerPassword);
  });

  test('merges permission flags when provided', () => {
    const opts = {};
    const flags = buildPermissionFlags({ copying: false, printing: 'lowResolution' });
    applyEncryption(opts, 'pw', flags);
    expect(opts.permissions.copying).toBe(false);
    expect(opts.permissions.printing).toBe('lowResolution');
  });

  test('skips permissions when empty object given', () => {
    const opts = {};
    applyEncryption(opts, 'pw', {});
    expect(opts.permissions).toBeUndefined();
  });
});

describe('permissions', () => {
  test('defaults to fully open', () => {
    const flags = buildPermissionFlags({});
    expect(flags.printing).toBe('highResolution');
    expect(flags.copying).toBe(true);
    expect(flags.modifying).toBe(true);
    expect(flags.annotating).toBe(true);
    expect(flags.fillingForms).toBe(true);
    expect(flags.contentAccessibility).toBe(true);
    expect(flags.documentAssembly).toBe(true);
  });

  test('respects restricted permissions', () => {
    const flags = buildPermissionFlags({
      printing: false,
      copying: false,
      modifying: false,
      annotating: false,
    });
    expect(flags.printing).toBe(false);
    expect(flags.copying).toBe(false);
    expect(flags.modifying).toBe(false);
    expect(flags.annotating).toBe(false);
  });

  test('supports lowResolution printing', () => {
    const flags = buildPermissionFlags({ printing: 'lowResolution' });
    expect(flags.printing).toBe('lowResolution');
  });

  test('preserves unset fields as defaults', () => {
    const flags = buildPermissionFlags({ copying: false });
    expect(flags.copying).toBe(false);
    expect(flags.printing).toBe('highResolution');
    expect(flags.modifying).toBe(true);
  });
});
