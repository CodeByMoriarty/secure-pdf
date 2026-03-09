# secure-pdf

[![npm version](https://img.shields.io/npm/v/secure-pdf.svg)](https://www.npmjs.com/package/secure-pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-CodeByMoriarty%2Fsecure--pdf-181717?logo=github)](https://github.com/CodeByMoriarty/secure-pdf)

Node.js package for generating highly secure PDFs. Combines AES-256 encryption, granular permissions, visible and forensic watermarking, self-destruct expiration, view tracking, QR-based authenticity verification, and cryptographic tamper detection into a single fluent API.

---

## Features

- **AES-256 Encryption** — password-protect PDFs with user and owner passwords
- **Granular Permissions** — control printing, copying, modifying, annotating per-document
- **Watermarks** — visible diagonal watermarks with full style control
- **Self-Destruct** — documents expire after a specified date
- **View Tracking** — embed unique IDs to trace document distribution
- **Forensic Watermarks** — invisible steganographic patterns for leak detection
- **QR Verification** — embedded QR codes linking to verification endpoints
- **Tamper Detection** — SHA-256 content hashing with integrity verification
- **Metadata** — title, author, classification, keywords, custom fields
- **Tables & Images** — built-in table renderer, image embedding, custom fonts
- **Fluent API** — chain all operations in a clean, readable style
- **TypeScript Ready** — complete `.d.ts` type definitions included
- **Minimal Dependencies** — only `pdfkit` and `qrcode`

---

## Installation

```bash
npm install secure-pdf
```

Requires Node.js 18 or later.

---

## Quick Start

```javascript
import { SecurePDF } from 'secure-pdf';

const pdf = new SecurePDF();
pdf
  .addText('Hello, Secure World!', { fontSize: 24, bold: true })
  .watermark('DRAFT')
  .encrypt('my-password');

await pdf.save('document.pdf');
```

---

## Usage Examples

### Basic PDF with Encryption

```javascript
import { SecurePDF } from 'secure-pdf';

const pdf = new SecurePDF();

pdf
  .addText('Quarterly Report', { fontSize: 28, bold: true })
  .moveDown(1)
  .addText('Revenue exceeded targets across all business units.')
  .addTable(
    [
      ['Region', 'Revenue', 'Growth'],
      ['North America', '$42M', '+18%'],
      ['Europe', '$28M', '+12%'],
      ['APAC', '$15M', '+31%'],
    ],
    { headerBackground: '#1a1a2e', headerColor: '#ffffff' }
  )
  .watermark('CONFIDENTIAL')
  .encrypt('report-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({
    title: 'Q4 Report',
    author: 'Finance Team',
    classification: 'CONFIDENTIAL',
  });

await pdf.save('quarterly-report.pdf');
```

### All Security Features

```javascript
import { SecurePDF } from 'secure-pdf';

const pdf = new SecurePDF();

await pdf
  .addPage()
  .addText('Confidential Report', { fontSize: 24, bold: true })
  .addTable([
    ['Name', 'Department', 'Clearance'],
    ['John Doe', 'Engineering', 'Level 3'],
  ])
  .watermark('CONFIDENTIAL', {
    opacity: 0.3,
    angle: 45,
    fontSize: 72,
  })
  .permissions({
    printing: 'lowResolution',
    modifying: false,
    copying: false,
    annotating: false,
  })
  .encrypt('SecurePass2024!')
  .metadata({
    title: 'Q4 Financial Report',
    author: 'Finance Team',
    subject: 'Confidential',
    keywords: ['finance', 'Q4', 'confidential'],
    classification: 'INTERNAL USE ONLY',
  })
  .expire('2026-12-31')
  .track('USER-12345-DOC-789')
  .forensicWatermark({ userId: 'jdoe', timestamp: true })
  .qrVerify('https://verify.company.com/check/')
  .tamperDetect(true)
  .save('confidential-report.pdf');
```

### Enterprise Document

```javascript
import { SecurePDF } from 'secure-pdf';

const recipientId = 'EXEC-CFO-2026';
const pdf = new SecurePDF({
  pageSize: 'Letter',
  margins: { top: 60, bottom: 60, left: 55, right: 55 },
});

pdf
  .addText('Annual Financial Summary', { fontSize: 32, bold: true, align: 'center' })
  .moveDown(2)
  .addText('CONFIDENTIAL — EXECUTIVE DISTRIBUTION ONLY', {
    fontSize: 12, bold: true, color: '#c0392b', align: 'center',
  })
  .addPage()
  .addText('Financial Summary', { fontSize: 22, bold: true })
  .addTable([
    ['Category', 'FY2024', 'FY2025', 'Change'],
    ['Revenue', '$142.3M', '$168.7M', '+18.6%'],
    ['Net Income', '$34.8M', '$49.4M', '+41.9%'],
  ])
  .watermark('CONFIDENTIAL', { fontSize: 60, opacity: 0.1 })
  .encrypt('AcmeFY2025!')
  .expire('2027-03-31')
  .track(recipientId)
  .forensicWatermark({ userId: recipientId, timestamp: true })
  .qrVerify('https://docs.acmecorp.internal/verify/')
  .tamperDetect('acme-fy2025-integrity');

const result = await pdf.save('enterprise-report.pdf');
console.log(`Hash: ${result.contentHash}`);
console.log(`Tracking: ${result.trackingId}`);
console.log(`Document ID: ${result.documentId}`);
```

### Get Buffer (No File)

```javascript
const { buffer, contentHash, trackingId, documentId } = await pdf.toBuffer();
// Use for HTTP responses, S3 uploads, email attachments, etc.
```

---

## Database Integration

`secure-pdf` does not connect to databases itself — you query your database first, then pass the data into the PDF builder. The core pattern is always the same regardless of which database you use:

```
Query DB  →  Map results to string[][]  →  Pass to .addTable()
```

The `secure-pdf` code is **identical across all databases** — only the query syntax changes.

---

### PostgreSQL (`pg`)

```javascript
import { SecurePDF } from 'secure-pdf';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 1. Fetch rows from PostgreSQL
const { rows } = await pool.query(
  'SELECT name, department, salary FROM employees ORDER BY department'
);

// 2. Build the PDF — same for every database
const pdf = new SecurePDF();

pdf
  .addText('Employee Report', { fontSize: 24, bold: true })
  .moveDown(1)
  .addText(`Generated: ${new Date().toLocaleDateString()}`, { fontSize: 11, color: '#888888' })
  .moveDown(1)
  .addTable([
    ['Name', 'Department', 'Salary'],
    ...rows.map(r => [r.name, r.department, `$${r.salary.toLocaleString()}`]),
  ])
  .watermark('CONFIDENTIAL')
  .encrypt('hr-password-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({ title: 'Employee Report', author: 'HR System', classification: 'INTERNAL' });

const { buffer } = await pdf.toBuffer();
```

---

### MySQL (`mysql2`)

```javascript
import { SecurePDF } from 'secure-pdf';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({ host: 'localhost', user: 'root', database: 'mydb' });

// 1. Fetch rows from MySQL
const [rows] = await pool.query(
  'SELECT name, department, salary FROM employees ORDER BY department'
);

// 2. Build the PDF — same for every database
const pdf = new SecurePDF();

pdf
  .addText('Employee Report', { fontSize: 24, bold: true })
  .moveDown(1)
  .addText(`Generated: ${new Date().toLocaleDateString()}`, { fontSize: 11, color: '#888888' })
  .moveDown(1)
  .addTable([
    ['Name', 'Department', 'Salary'],
    ...rows.map(r => [r.name, r.department, `$${r.salary.toLocaleString()}`]),
  ])
  .watermark('CONFIDENTIAL')
  .encrypt('hr-password-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({ title: 'Employee Report', author: 'HR System', classification: 'INTERNAL' });

const { buffer } = await pdf.toBuffer();
```

---

### SQLite (`better-sqlite3`)

```javascript
import { SecurePDF } from 'secure-pdf';
import Database from 'better-sqlite3';

const db = new Database('mydb.sqlite');

// 1. Fetch rows from SQLite (synchronous)
const rows = db.prepare(
  'SELECT name, department, salary FROM employees ORDER BY department'
).all();

// 2. Build the PDF — same for every database
const pdf = new SecurePDF();

pdf
  .addText('Employee Report', { fontSize: 24, bold: true })
  .moveDown(1)
  .addText(`Generated: ${new Date().toLocaleDateString()}`, { fontSize: 11, color: '#888888' })
  .moveDown(1)
  .addTable([
    ['Name', 'Department', 'Salary'],
    ...rows.map(r => [r.name, r.department, `$${r.salary.toLocaleString()}`]),
  ])
  .watermark('CONFIDENTIAL')
  .encrypt('hr-password-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({ title: 'Employee Report', author: 'HR System', classification: 'INTERNAL' });

const { buffer } = await pdf.toBuffer();
```

---

### MongoDB (`mongodb`)

```javascript
import { SecurePDF } from 'secure-pdf';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db('mydb');

// 1. Fetch documents from MongoDB
const employees = await db.collection('employees')
  .find({})
  .sort({ department: 1 })
  .toArray();

// 2. Build the PDF — same for every database
const pdf = new SecurePDF();

pdf
  .addText('Employee Report', { fontSize: 24, bold: true })
  .moveDown(1)
  .addText(`Generated: ${new Date().toLocaleDateString()}`, { fontSize: 11, color: '#888888' })
  .moveDown(1)
  .addTable([
    ['Name', 'Department', 'Salary'],
    ...employees.map(e => [e.name, e.department, `$${e.salary.toLocaleString()}`]),
  ])
  .watermark('CONFIDENTIAL')
  .encrypt('hr-password-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({ title: 'Employee Report', author: 'HR System', classification: 'INTERNAL' });

const { buffer } = await pdf.toBuffer();
```

> **Note:** MongoDB returns plain objects (documents), not rows. Access fields directly — `e.name`, `e.department`. For nested fields use dot access: `e.address.city`. Use `e._id.toString()` when passing to `.track()`.

---

### Mongoose

```javascript
import { SecurePDF } from 'secure-pdf';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_URI);

const Employee = mongoose.model('Employee', new mongoose.Schema({
  name: String,
  department: String,
  salary: Number,
}));

// 1. Fetch documents using Mongoose
const employees = await Employee.find().sort({ department: 1 }).lean();

// 2. Build the PDF — same for every database
const pdf = new SecurePDF();

pdf
  .addText('Employee Report', { fontSize: 24, bold: true })
  .moveDown(1)
  .addText(`Generated: ${new Date().toLocaleDateString()}`, { fontSize: 11, color: '#888888' })
  .moveDown(1)
  .addTable([
    ['Name', 'Department', 'Salary'],
    ...employees.map(e => [e.name, e.department, `$${e.salary.toLocaleString()}`]),
  ])
  .watermark('CONFIDENTIAL')
  .encrypt('hr-password-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({ title: 'Employee Report', author: 'HR System', classification: 'INTERNAL' });

const { buffer } = await pdf.toBuffer();
```

> **Tip:** Use `.lean()` on Mongoose queries to get plain JavaScript objects instead of Mongoose documents — this makes field access faster and more predictable.

---

### Prisma

```javascript
import { SecurePDF } from 'secure-pdf';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Fetch records using Prisma
const employees = await prisma.employee.findMany({
  orderBy: { department: 'asc' },
  select: { name: true, department: true, salary: true },
});

// 2. Build the PDF — same for every database
const pdf = new SecurePDF();

pdf
  .addText('Employee Report', { fontSize: 24, bold: true })
  .moveDown(1)
  .addText(`Generated: ${new Date().toLocaleDateString()}`, { fontSize: 11, color: '#888888' })
  .moveDown(1)
  .addTable([
    ['Name', 'Department', 'Salary'],
    ...employees.map(e => [e.name, e.department, `$${e.salary.toLocaleString()}`]),
  ])
  .watermark('CONFIDENTIAL')
  .encrypt('hr-password-2026')
  .permissions({ copying: false, modifying: false })
  .metadata({ title: 'Employee Report', author: 'HR System', classification: 'INTERNAL' });

const { buffer } = await pdf.toBuffer();
```

---

### Sending a PDF as an HTTP Response

This pattern works with any of the database clients above — just swap the query section:

```javascript
import express from 'express';
import { SecurePDF } from 'secure-pdf';

const app = express();

app.get('/reports/invoices/:id', async (req, res) => {
  // Swap this block for whichever DB client you use
  const rows = await yourDb.getInvoiceItems(req.params.id);

  if (!rows.length) return res.status(404).send('Invoice not found');

  const pdf = new SecurePDF();

  pdf
    .addText(`Invoice #${req.params.id}`, { fontSize: 26, bold: true })
    .moveDown(1)
    .addTable([
      ['Item', 'Qty', 'Unit Price', 'Total'],
      ...rows.map(r => [r.description, String(r.qty), `$${r.unit_price}`, `$${r.total}`]),
    ])
    .metadata({ title: `Invoice #${req.params.id}`, author: 'Billing System' })
    .encrypt('invoice-2026');

  const { buffer } = await pdf.toBuffer();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="invoice-${req.params.id}.pdf"`,
    'Content-Length': buffer.length,
  });
  res.send(buffer);
});
```

---

### Per-User Document Tracking

Combine `.track()` and `.forensicWatermark()` with a DB-stored user ID to trace distributed documents back to their recipient. Works with any database — just fetch the user record first:

```javascript
// PostgreSQL / MySQL / SQLite: recipient = user.rows[0] or rows[0]
// MongoDB / Mongoose: recipient = await User.findById(userId).lean()
// Prisma: recipient = await prisma.user.findUnique({ where: { id: userId } })

const pdf = new SecurePDF();

pdf
  .addText(`Welcome, ${recipient.name}`, { fontSize: 20, bold: true })
  .addText('This document is personalized and tracked.', { fontSize: 12 })
  .track(`USER-${recipient.id ?? recipient._id.toString()}`)
  .forensicWatermark({ userId: recipient.email, timestamp: true })
  .encrypt('access-password')
  .tamperDetect(true);

const { buffer, trackingId } = await pdf.toBuffer();

// Optionally log the tracking ID back to the database
// e.g. await db.query('INSERT INTO document_log ...') or
//      await prisma.documentLog.create({ data: { userId, trackingId } })
```

---

### Supported Database Clients

| Database   | Client                              |
|------------|-------------------------------------|
| PostgreSQL | `pg`, `postgres`                    |
| MySQL      | `mysql2`                            |
| SQLite     | `better-sqlite3`                    |
| MongoDB    | `mongodb`, `mongoose`               |
| Any ORM    | `prisma`, `drizzle`, `sequelize`    |

---

## API Reference

### Constructor

```javascript
new SecurePDF(options?)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `documentId` | `string` | auto-generated | Custom document identifier |
| `pageSize` | `string` | `'A4'` | Page size (`'A4'`, `'Letter'`, etc.) |
| `margins` | `object` | `{ top: 50, bottom: 50, left: 50, right: 50 }` | Page margins in points |

### Instance Properties

| Property | Type | Description |
|---|---|---|
| `documentId` | `string` | The unique identifier for this document instance |

### Content Methods

All content methods return `this` for chaining.

| Method | Parameters | Description |
|---|---|---|
| `addText(text, options?)` | `text: string`, `options: TextOptions` | Add a text block |
| `addPage(options?)` | `options: object` | Insert a page break |
| `addImage(source, options?)` | `source: string \| Buffer`, `options: ImageOptions` | Embed an image |
| `addTable(rows, options?)` | `rows: string[][]`, `options: TableOptions` | Render a table (first row = header) |
| `setFont(name, path)` | `name: string`, `path: string` | Register and use a custom font |
| `moveDown(lines?)` | `lines: number` | Add vertical spacing |

#### TextOptions

| Property | Type | Description |
|---|---|---|
| `fontSize` | `number` | Font size in points |
| `bold` | `boolean` | Use bold weight |
| `italic` | `boolean` | Use italic style |
| `underline` | `boolean` | Underline text |
| `color` | `string` | Fill color (hex) |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | Text alignment |
| `font` | `string` | Font name override |
| `link` | `string` | Hyperlink URL |
| `width` | `number` | Maximum width for text wrapping (points) |
| `lineBreak` | `boolean` | Enable or disable automatic line breaks |
| `indent` | `number` | Left indent in points |

#### ImageOptions

| Property | Type | Description |
|---|---|---|
| `x` | `number` | Absolute x position |
| `y` | `number` | Absolute y position |
| `width` | `number` | Image width in points |
| `height` | `number` | Image height in points |
| `fit` | `[number, number]` | Fit image within `[width, height]` bounds |
| `align` | `'left' \| 'center' \| 'right'` | Horizontal alignment |
| `valign` | `'top' \| 'center' \| 'bottom'` | Vertical alignment |

#### TableOptions

| Property | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `number` | `10` | Font size for all cells |
| `columnWidth` | `number` | auto (equal split) | Fixed width per column in points |
| `headerBackground` | `string` | `'#eeeeee'` | Header row background color (hex) |
| `headerColor` | `string` | `'#333333'` | Header row text color (hex) |
| `cellColor` | `string` | `'#000000'` | Body cell text color (hex) |
| `borderColor` | `string` | `'#cccccc'` | Cell border color (hex) |

### Security Methods

| Method | Parameters | Description |
|---|---|---|
| `encrypt(password)` | `password: string` | AES-256 encryption with user password |
| `permissions(config)` | `config: PermissionsConfig` | Set document permissions |
| `metadata(config)` | `config: MetadataConfig` | Set document metadata |
| `watermark(text, options?)` | `text: string`, `options: WatermarkOptions` | Visible watermark on every page |
| `expire(date)` | `date: string \| Date` | Self-destruct after date |
| `track(id)` | `id: string` | Embed tracking identifier |
| `forensicWatermark(config?)` | `config: ForensicConfig` | Hidden forensic watermark |
| `qrVerify(url, options?)` | `url: string`, `options: QROptions` | Embed verification QR code |
| `tamperDetect(enableOrSalt?)` | `boolean \| string` | Enable content integrity hashing |

#### PermissionsConfig

| Property | Type | Values |
|---|---|---|
| `printing` | `string \| boolean` | `'highResolution'`, `'lowResolution'`, `true`, `false` |
| `modifying` | `boolean` | Allow content modification |
| `copying` | `boolean` | Allow content copying |
| `annotating` | `boolean` | Allow annotations |
| `fillingForms` | `boolean` | Allow form filling |
| `contentAccessibility` | `boolean` | Allow accessibility extraction |
| `documentAssembly` | `boolean` | Allow page assembly |

#### MetadataConfig

| Property | Type | Description |
|---|---|---|
| `title` | `string` | Document title |
| `author` | `string` | Document author |
| `subject` | `string` | Document subject |
| `keywords` | `string \| string[]` | Search keywords |
| `creator` | `string` | Creating application name |
| `producer` | `string` | PDF producer name |
| `company` | `string` | Organization name |
| `classification` | `string` | Security classification label |

#### WatermarkOptions

| Property | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `number` | `60` | Watermark font size |
| `color` | `string` | `'#cccccc'` | Watermark color |
| `opacity` | `number` | `0.15` | Opacity (0–1) |
| `angle` | `number` | `-45` | Rotation in degrees |
| `font` | `string` | `'Helvetica'` | Font name |

#### QROptions

| Property | Type | Description |
|---|---|---|
| `x` | `number` | Absolute x position of the QR code |
| `y` | `number` | Absolute y position of the QR code |
| `size` | `number` | QR code size in points |

#### ForensicConfig

| Property | Type | Description |
|---|---|---|
| `userId` | `string` | User identifier to embed in forensic pattern |
| `timestamp` | `boolean` | Include generation timestamp in pattern |

### Output Methods

| Method | Returns | Description |
|---|---|---|
| `save(filePath)` | `Promise<SaveResult>` | Write PDF to disk |
| `toBuffer()` | `Promise<BufferResult>` | Get PDF as in-memory Buffer |

#### SaveResult

```typescript
{
  path: string;          // Absolute file path
  size: number;          // File size in bytes
  documentId: string;    // Document identifier
  contentHash: string;   // SHA-256 hash (if tamperDetect enabled)
  trackingId: string;    // Tracking ID (if track enabled)
}
```

#### BufferResult

```typescript
{
  buffer: Buffer;        // Raw PDF bytes
  contentHash: string;   // SHA-256 hash (if tamperDetect enabled)
  trackingId: string;    // Tracking ID (if track enabled)
  documentId: string;    // Document identifier
}
```

---

## Security Features

### Encryption

Uses pdfkit's built-in AES-256 encryption. A **user password** is required to open the document. An **owner password** is auto-generated with cryptographically secure random bytes and controls permission overrides.

### Self-Destruct / Expiration

Two-layer approach:
1. **PDF JavaScript** — executes on open in Adobe Acrobat and compatible readers; closes the document if expired
2. **Visible notice** — red warning at the bottom of the last page for readers that don't execute JavaScript

> PDF JavaScript is not supported in all viewers. The visible notice provides fallback coverage.

### Tamper Detection

A SHA-256 hash is computed over all text content and embedded in the PDF metadata (`ContentHash` key). Verify integrity programmatically:

```javascript
import { verifyContentHash } from 'secure-pdf';

const result = verifyContentHash(
  savedResult.contentHash,
  ['your', 'content', 'parts'],
  'your-salt'
);
console.log(result.valid);   // true or false
console.log(result.message); // "Document integrity verified." or "Document has been tampered with."
```

### View Tracking

Each tracked document gets a unique ID embedded in:
- PDF metadata (`TrackingID` info key)
- Hidden near-invisible watermark grid across every page
- Invisible selectable text at the page bottom

This enables forensic identification of the source copy if a document is leaked.

### Forensic Watermarks

When `.forensicWatermark()` is called, a grid of nearly invisible text containing the user ID and timestamp is scattered across every page using a staggered pattern. Corner markers provide additional forensic anchors. The pattern is designed to survive most image processing operations while remaining invisible to the naked eye.

### QR Verification

A QR code is embedded on the last page that encodes the verification URL with the document's content hash as a query parameter. Recipients can scan to verify authenticity against a server-side verification endpoint.

---

## Error Handling

`secure-pdf` exports structured error classes for precise error handling:

```javascript
import {
  SecurePDFError,
  ValidationError,
  EncryptionError,
  BuildError,
  FeatureError,
} from 'secure-pdf';

try {
  await pdf.save('output.pdf');
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(`Invalid input on field "${err.field}": ${err.message}`);
  } else if (err instanceof BuildError) {
    console.error(`PDF generation failed: ${err.message}`);
  } else if (err instanceof EncryptionError) {
    console.error(`Encryption error: ${err.message}`);
  } else {
    throw err;
  }
}
```

### Error Classes

| Class | Code | Description |
|---|---|---|
| `SecurePDFError` | base | Base class for all package errors |
| `ValidationError` | — | Invalid input; includes `field` property |
| `EncryptionError` | — | Encryption configuration failure |
| `BuildError` | — | PDF generation or rendering failure |
| `FeatureError` | — | Feature-specific failure; includes `feature` property |

---

## Exported Utilities

In addition to the main class, the package exports low-level utilities for advanced use:

### Crypto Utilities

```javascript
import { sha256, sha256Multi, hmacSha256, generateDocumentId } from 'secure-pdf';

sha256('some data');                        // → hex string
sha256Multi(['part1', 'part2'], 'salt');    // → hex string
hmacSha256('secret-key', 'data');          // → hex string
generateDocumentId();                       // → unique document ID string
```

### Feature Functions

```javascript
import {
  verifyContentHash,
  applyEncryption,
  buildPermissionFlags,
  renderWatermark,
  applyMetadata,
  applyExpiration,
  embedTracking,
  renderForensicWatermark,
  renderQRVerification,
  computeContentHash,
  embedContentHash,
} from 'secure-pdf';
```

These are exported for advanced integrations or custom PDF builders using `PDFBuilder` directly.

---

## TypeScript

The package includes complete type definitions. No additional `@types` package is needed.

```typescript
import { SecurePDF, type SaveResult, type PermissionsConfig, type BufferResult } from 'secure-pdf';

const perms: PermissionsConfig = {
  printing: 'lowResolution',
  copying: false,
};

const pdf = new SecurePDF();
pdf.addText('Typed document').permissions(perms);

const result: SaveResult = await pdf.save('typed.pdf');
const { buffer }: BufferResult = await pdf.toBuffer();
```

---

## Testing

```bash
npm test                  # Run all tests
npm run test:coverage     # Run with coverage report
```

Tests are structured as:
- `tests/unit/` — isolated tests for each feature module
- `tests/integration/` — end-to-end workflow tests

---

## Examples

```bash
npm run example:basic       # Simple encrypted PDF
npm run example:advanced    # All security features
npm run example:enterprise  # Corporate document workflow
```

Output is written to `examples/output/`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for new functionality
4. Ensure `npm test` passes
5. Commit with clear messages using conventional commits
6. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/CodeByMoriarty/secure-pdf.git
cd secure-pdf
npm install
npm test
```

---

## License

[MIT](LICENSE)

---

## Support

Open an issue at the [GitHub repository](https://github.com/CodeByMoriarty/secure-pdf/issues) for bug reports, feature requests, or questions.

You can also reach the maintainer by email: [alacambradev@gmail.com](mailto:alacambradev@gmail.com)

For security vulnerabilities, please see [SECURITY.md](SECURITY.md).