import { describe, test, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', '..', 'examples', 'output');

let SecurePDF;

beforeAll(async () => {
  const mod = await import('../../src/index.js');
  SecurePDF = mod.SecurePDF;
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
});

afterAll(() => {
  // Clean up test PDFs
  const files = ['int-basic.pdf', 'int-encrypted.pdf', 'int-full.pdf', 'int-multi.pdf', 'int-table.pdf'];
  for (const f of files) {
    const p = path.join(OUT_DIR, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
});

describe('basic workflow', () => {
  test('creates instance with documentId', () => {
    const pdf = new SecurePDF();
    expect(pdf.documentId).toBeDefined();
    expect(typeof pdf.documentId).toBe('string');
  });

  test('fluent methods return this', () => {
    const pdf = new SecurePDF();
    const result = pdf.addText('Hello').addPage().addText('World');
    expect(result).toBe(pdf);
  });

  test('toBuffer returns a valid PDF buffer', async () => {
    const pdf = new SecurePDF();
    pdf.addText('Hello World');
    const { buffer } = await pdf.toBuffer();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString('ascii', 0, 5)).toBe('%PDF-');
  });

  test('save writes file to disk', async () => {
    const outFile = path.join(OUT_DIR, 'int-basic.pdf');
    const pdf = new SecurePDF();
    pdf.addText('Test document');
    const result = await pdf.save(outFile);

    expect(result.path).toBe(outFile);
    expect(result.size).toBeGreaterThan(0);
    expect(fs.existsSync(outFile)).toBe(true);
  });
});

describe('encryption workflow', () => {
  test('encrypted PDF starts with %PDF-', async () => {
    const pdf = new SecurePDF();
    pdf.addText('Secret content').encrypt('mypassword');
    const { buffer } = await pdf.toBuffer();
    expect(buffer.toString('ascii', 0, 5)).toBe('%PDF-');
  });

  test('encrypted PDF with permissions', async () => {
    const outFile = path.join(OUT_DIR, 'int-encrypted.pdf');
    const pdf = new SecurePDF();
    pdf
      .addText('Locked document')
      .encrypt('pass123')
      .permissions({ copying: false, printing: false, modifying: false });
    const result = await pdf.save(outFile);
    expect(result.size).toBeGreaterThan(0);
  });
});

describe('multi-page workflow', () => {
  test('generates multi-page document', async () => {
    const outFile = path.join(OUT_DIR, 'int-multi.pdf');
    const pdf = new SecurePDF();
    pdf
      .addText('Page 1')
      .addPage()
      .addText('Page 2')
      .addPage()
      .addText('Page 3')
      .watermark('DRAFT');

    const result = await pdf.save(outFile);
    expect(result.size).toBeGreaterThan(500);
  });
});

describe('table workflow', () => {
  test('generates document with table', async () => {
    const outFile = path.join(OUT_DIR, 'int-table.pdf');
    const pdf = new SecurePDF();
    pdf
      .addText('Employee Records', { fontSize: 18, bold: true })
      .addTable([
        ['Name', 'Role', 'Clearance'],
        ['Alice', 'Engineer', 'Level 3'],
        ['Bob', 'Manager', 'Level 5'],
      ]);

    const result = await pdf.save(outFile);
    expect(result.size).toBeGreaterThan(0);
  });
});

describe('all features combined', () => {
  test('generates fully-featured secure document', async () => {
    const outFile = path.join(OUT_DIR, 'int-full.pdf');
    const pdf = new SecurePDF();

    pdf
      .addText('Classified Report', { fontSize: 24, bold: true })
      .addText('This is a comprehensive security test.')
      .addTable([
        ['Category', 'Value'],
        ['Revenue', '$10M'],
        ['Expenses', '$6M'],
      ])
      .addPage()
      .addText('Page 2 — Additional Details')
      .watermark('TOP SECRET', { fontSize: 72, opacity: 0.08, color: '#ff0000' })
      .permissions({ copying: false, printing: 'lowResolution', modifying: false })
      .encrypt('securePass!')
      .metadata({
        title: 'Integration Test Report',
        author: 'Test Suite',
        classification: 'TOP SECRET',
        keywords: ['test', 'integration'],
      })
      .expire('2099-12-31')
      .track('TEST-TRACK-001')
      .forensicWatermark({ userId: 'testuser', timestamp: true })
      .qrVerify('https://verify.example.com/check/')
      .tamperDetect('integration-salt');

    const result = await pdf.save(outFile);

    expect(result.path).toBe(outFile);
    expect(result.size).toBeGreaterThan(1000);
    expect(result.documentId).toBeDefined();
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.trackingId).toBe('TEST-TRACK-001');
    expect(fs.existsSync(outFile)).toBe(true);
  }, 20000);
});

describe('validation', () => {
  test('encrypt rejects empty password', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.encrypt('')).toThrow();
  });

  test('track rejects empty string', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.track('')).toThrow();
  });

  test('qrVerify rejects invalid URL', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.qrVerify('not a url')).toThrow();
  });

  test('expire rejects past date', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.expire('2000-01-01')).toThrow();
  });

  test('permissions rejects invalid keys', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.permissions({ invalidKey: true })).toThrow();
  });

  test('addText rejects non-string', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.addText(42)).toThrow();
  });

  test('addTable rejects empty array', () => {
    const pdf = new SecurePDF();
    expect(() => pdf.addTable([])).toThrow();
  });
});
