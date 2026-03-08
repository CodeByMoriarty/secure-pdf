import { sha256 } from '../utils/crypto.js';

export function renderForensicWatermark(doc, config = {}) {
  const { width, height } = doc.page;
  const userId = config.userId || 'unknown';
  const now = config.timestamp ? new Date().toISOString() : '';
  const payload = `${userId}|${now}|${sha256(userId + now).slice(0, 12)}`;

  // Steganographic-style: very low opacity, tiny font, grid pattern
  doc.save();
  doc.opacity(0.018);
  doc.fontSize(4);
  doc.font('Helvetica');
  doc.fillColor('#888888');

  const cols = Math.floor((width - 40) / 100);
  const rows = Math.floor((height - 60) / 80);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 20 + c * 100 + (r % 2) * 30; // stagger for harder removal
      const y = 30 + r * 80;
      doc.text(payload, x, y, { lineBreak: false, continued: false });
    }
  }

  // Subtle color-variation marker in corners (single-pixel range color shifts)
  const markerText = `F:${userId}`;
  const corners = [
    [6, 6],
    [width - 60, 6],
    [6, height - 10],
    [width - 60, height - 10],
  ];
  doc.opacity(0.012);
  doc.fontSize(3);
  for (const [mx, my] of corners) {
    doc.text(markerText, mx, my, { lineBreak: false, continued: false });
  }

  doc.restore();
}
