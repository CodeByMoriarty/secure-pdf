import { describe, test, expect } from '@jest/globals';
import PDFDocument from 'pdfkit';

let renderWatermark;

beforeAll(async () => {
  const mod = await import('../../src/features/watermark.js');
  renderWatermark = mod.renderWatermark;
});

function createDoc() {
  return new PDFDocument({ bufferPages: true });
}

describe('watermark', () => {
  test('renders without errors using default options', () => {
    const doc = createDoc();
    expect(() => renderWatermark(doc, 'CONFIDENTIAL')).not.toThrow();
    doc.end();
  });

  test('accepts custom options', () => {
    const doc = createDoc();
    expect(() =>
      renderWatermark(doc, 'SECRET', {
        fontSize: 80,
        color: '#ff0000',
        opacity: 0.1,
        angle: -30,
        font: 'Helvetica-Bold',
      }),
    ).not.toThrow();
    doc.end();
  });

  test('uses provided font', () => {
    const doc = createDoc();
    renderWatermark(doc, 'TEST', { font: 'Courier' });
    doc.end();
    // No error means the font was accepted
  });
});
