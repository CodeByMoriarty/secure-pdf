import { SecurePDF } from '../src/index.js';

const pdf = new SecurePDF();

pdf
  .addText('Quarterly Business Report', { fontSize: 26, bold: true, color: '#1a1a2e' })
  .moveDown(1)
  .addText('Prepared by Finance Team', { fontSize: 12, color: '#666666' })
  .addText(`Generated: ${new Date().toISOString().split('T')[0]}`, { fontSize: 11, color: '#888888' })
  .moveDown(2)
  .addText(
    'This report contains the quarterly financial overview and key performance ' +
    'indicators for the current business period. Distribution is limited to ' +
    'authorized personnel only.',
    { fontSize: 12 },
  )
  .moveDown(1)
  .addTable([
    ['Metric', 'Q3 2025', 'Q4 2025', 'Change'],
    ['Revenue', '$8.2M', '$9.4M', '+14.6%'],
    ['Expenses', '$5.1M', '$5.3M', '+3.9%'],
    ['Net Profit', '$3.1M', '$4.1M', '+32.3%'],
  ])
  .watermark('DRAFT', { opacity: 0.12 })
  .encrypt('demo-password')
  .metadata({
    title: 'Q4 Business Report',
    author: 'Finance Team',
    classification: 'INTERNAL',
  });

const result = await pdf.save('examples/output/basic-report.pdf');

console.log(`PDF saved: ${result.path}`);
console.log(`Size: ${(result.size / 1024).toFixed(1)} KB`);
console.log(`Document ID: ${result.documentId}`);
console.log(`\nOpen with password: demo-password`);
