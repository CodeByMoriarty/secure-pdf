import { SecurePDF, verifyContentHash } from '../src/index.js';

async function generateExecutiveBrief() {
  const recipientId = 'EXEC-CFO-2026';

  const pdf = new SecurePDF({
    pageSize: 'Letter',
    margins: { top: 60, bottom: 60, left: 55, right: 55 },
  });

  // Cover page
  pdf
    .addText('ACME CORPORATION', { fontSize: 14, bold: true, color: '#2c3e50', align: 'center' })
    .moveDown(6)
    .addText('Annual Financial Summary', { fontSize: 32, bold: true, color: '#1a1a2e', align: 'center' })
    .moveDown(1)
    .addText('Fiscal Year 2025', { fontSize: 18, color: '#555555', align: 'center' })
    .moveDown(3)
    .addText('CONFIDENTIAL — EXECUTIVE DISTRIBUTION ONLY', {
      fontSize: 12,
      bold: true,
      color: '#c0392b',
      align: 'center',
    })
    .moveDown(1)
    .addText(`Recipient: ${recipientId}`, { fontSize: 10, color: '#888888', align: 'center' })
    .addText(`Issued: ${new Date().toLocaleDateString('en-US')}`, { fontSize: 10, color: '#888888', align: 'center' });

  // Financial summary page
  pdf
    .addPage()
    .addText('Financial Summary', { fontSize: 22, bold: true, color: '#1a1a2e' })
    .moveDown(1)
    .addTable([
      ['Category', 'FY2024', 'FY2025', 'YoY Change'],
      ['Total Revenue', '$142.3M', '$168.7M', '+18.6%'],
      ['Operating Costs', '$89.1M', '$95.2M', '+6.9%'],
      ['Gross Profit', '$53.2M', '$73.5M', '+38.2%'],
      ['R&D Investment', '$18.4M', '$24.1M', '+31.0%'],
      ['Net Income', '$34.8M', '$49.4M', '+41.9%'],
      ['EPS', '$2.14', '$3.04', '+42.1%'],
    ])
    .moveDown(1)
    .addText(
      'Revenue growth was primarily driven by expansion in the enterprise segment (+28%) ' +
      'and international markets (+34%). Operating margin improved from 37.4% to 43.6%, ' +
      'reflecting economies of scale and operational efficiency initiatives.',
      { fontSize: 11 },
    );

  // Headcount page
  pdf
    .addPage()
    .addText('Headcount & Compensation', { fontSize: 22, bold: true, color: '#1a1a2e' })
    .moveDown(1)
    .addTable([
      ['Division', 'Headcount', 'Avg Comp', 'Budget'],
      ['Engineering', '342', '$185k', '$63.3M'],
      ['Sales', '128', '$145k', '$18.6M'],
      ['Marketing', '67', '$130k', '$8.7M'],
      ['G&A', '45', '$120k', '$5.4M'],
      ['Executive', '12', '$340k', '$4.1M'],
    ])
    .moveDown(1)
    .addText(
      'Total headcount grew 22% year-over-year, with engineering representing 57% of all ' +
      'new hires. Engineering compensation increased 8% to remain competitive in key markets.',
      { fontSize: 11 },
    );

  // Apply security
  pdf
    .watermark('CONFIDENTIAL', { fontSize: 60, opacity: 0.1, color: '#cc0000' })
    .permissions({ copying: false, modifying: false, annotating: false, printing: 'lowResolution' })
    .encrypt('AcmeFY2025!')
    .metadata({
      title: 'Acme Corp — FY2025 Annual Financial Summary',
      author: 'Office of the CFO',
      subject: 'Annual Financial Report',
      keywords: ['finance', 'annual', 'FY2025', 'confidential'],
      company: 'Acme Corporation',
      classification: 'CONFIDENTIAL',
    })
    .expire('2027-03-31')
    .track(recipientId)
    .forensicWatermark({ userId: recipientId, timestamp: true })
    .qrVerify('https://docs.acmecorp.internal/verify/')
    .tamperDetect('acme-fy2025-integrity');

  const result = await pdf.save('examples/output/enterprise-document.pdf');

  console.log('Enterprise Document Generated');
  console.log(`  Path:        ${result.path}`);
  console.log(`  Size:        ${(result.size / 1024).toFixed(1)} KB`);
  console.log(`  Document ID: ${result.documentId}`);
  console.log(`  Recipient:   ${result.trackingId}`);
  console.log(`  Hash:        ${result.contentHash}`);

  // Demonstrate tamper verification
  console.log('\n--- Tamper Verification Demo ---');
  const check = verifyContentHash(
    result.contentHash,
    [
      'ACME CORPORATION', 'Annual Financial Summary', 'Fiscal Year 2025',
      'CONFIDENTIAL — EXECUTIVE DISTRIBUTION ONLY',
      // This would normally include all text content
    ],
    'acme-fy2025-integrity',
  );
  // Expected to fail here since we didn't pass ALL content parts
  console.log(`  Verification: ${check.message}`);
  console.log(`  (Note: partial content check — see API docs for full verification)`);
}

generateExecutiveBrief().catch(console.error);
