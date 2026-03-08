import { sha256Multi, constantTimeCompare } from '../utils/crypto.js';

export function computeContentHash(textParts, salt = '') {
  return sha256Multi(textParts, salt);
}

export function embedContentHash(doc, hash) {
  doc.info['ContentHash'] = hash;
  doc.info['SecurePDF-Integrity'] = hash;
}

export function renderIntegritySeal(doc, hash) {
  const { width } = doc.page;
  const shortHash = hash.slice(0, 16);

  doc.save();
  doc.fontSize(6);
  doc.font('Helvetica');
  doc.fillColor('#999999');
  doc.text(`Integrity: ${shortHash}...`, 40, 18, {
    width: width - 80,
    align: 'right',
    lineBreak: false,
  });
  doc.restore();
}

export function verifyContentHash(expected, contentParts, salt = '') {
  const actual = computeContentHash(contentParts, salt);
  const match = constantTimeCompare(expected, actual);
  return {
    valid: match,
    expected,
    actual,
    message: match ? 'Document integrity verified.' : 'Document has been tampered with.',
  };
}
