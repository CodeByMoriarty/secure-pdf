import { SecurePDF } from '../src/index.js';

const pdf = new SecurePDF({ pageSize: 'A4' });

pdf
  .addText('CLASSIFIED — Project Phoenix', { fontSize: 28, bold: true, color: '#c0392b' })
  .moveDown(1)
  .addText('Classification: TOP SECRET / NOFORN', { fontSize: 13, bold: true, color: '#e74c3c' })
  .addText(`Document ID: ${pdf.documentId}`, { fontSize: 10, color: '#555555' })
  .addText(`Generated: ${new Date().toISOString()}`, { fontSize: 10, color: '#555555' })
  .moveDown(2)
  .addText(
    'This document exercises every security feature of the secure-pdf package. It is ' +
    'password encrypted, permission-locked, watermarked, tracked, forensically marked, ' +
    'integrity-hashed, QR-verified, and set to expire.',
    { fontSize: 12 },
  )
  .moveDown(1)
  .addTable([
    ['Feature', 'Status', 'Detail'],
    ['Encryption', 'Enabled', 'AES-256'],
    ['Permissions', 'Locked', 'No copy/print/modify'],
    ['Watermark', 'Visible', 'TOP SECRET'],
    ['Expiration', 'Active', '2026-12-31'],
    ['View Tracking', 'Active', 'USER-SEC-0042'],
    ['Forensic Mark', 'Active', 'User: analyst-7'],
    ['QR Verification', 'Embedded', 'verify.example.com'],
    ['Tamper Detection', 'Enabled', 'SHA-256 hash'],
  ])
  .addPage()
  .addText('Personnel Clearance Matrix', { fontSize: 20, bold: true })
  .moveDown(1)
  .addTable([
    ['Name', 'Role', 'Clearance', 'Status'],
    ['Dr. Sarah Chen', 'Project Lead', 'TS/SCI', 'Active'],
    ['James Rodriguez', 'Security Officer', 'TS/SCI', 'Active'],
    ['Mika Tanaka', 'Lead Engineer', 'TS', 'Active'],
    ['Alex Petrov', 'Data Scientist', 'SECRET', 'Under Review'],
    ['Priya Sharma', 'Cryptography Lead', 'TS/SCI', 'Active'],
  ])
  .watermark('TOP SECRET', { fontSize: 72, color: '#ff0000', opacity: 0.07 })
  .permissions({
    printing: false,
    copying: false,
    modifying: false,
    annotating: false,
  })
  .encrypt('phoenix-2026!')
  .metadata({
    title: 'Project Phoenix — Security Brief',
    author: 'Security Division',
    subject: 'Classified Operations',
    keywords: ['phoenix', 'classified', 'top-secret'],
    company: 'REDACTED',
    classification: 'TOP SECRET',
  })
  .expire('2026-12-31')
  .track('USER-SEC-0042')
  .forensicWatermark({ userId: 'analyst-7', timestamp: true })
  .qrVerify('https://verify.example.com/check/')
  .tamperDetect('phoenix-integrity-key');

const result = await pdf.save('examples/output/advanced-security.pdf');

console.log('Advanced Security PDF Generated');
console.log(`  Path:        ${result.path}`);
console.log(`  Size:        ${(result.size / 1024).toFixed(1)} KB`);
console.log(`  Document ID: ${result.documentId}`);
console.log(`  Tracking:    ${result.trackingId}`);
console.log(`  Hash:        ${result.contentHash}`);
console.log(`  Password:    phoenix-2026!`);
console.log(`  Expires:     2026-12-31`);
