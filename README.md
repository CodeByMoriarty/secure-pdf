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
  .addTable([
    ['Region', 'Revenue', 'Growth'],
    ['North America', '$42M', '+18%'],
    ['Europe', '$28M', '+12%'],
    ['APAC', '$15M', '+31%'],
  ])
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
```

### Get Buffer (No File)

```javascript
const { buffer, contentHash } = await pdf.toBuffer();
// Use for HTTP responses, S3 uploads, email attachments, etc.
```

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

### Content Methods

All content methods return `this` for chaining.

| Method | Parameters | Description |
|---|---|---|
| `addText(text, options?)` | `text: string`, `options: TextOptions` | Add a text block |
| `addPage(options?)` | `options: object` | Insert page break |
| `addImage(source, options?)` | `source: string \| Buffer`, `options: ImageOptions` | Embed image |
| `addTable(rows, options?)` | `rows: string[][]`, `options: TableOptions` | Render table (first row = header) |
| `setFont(name, path)` | `name: string`, `path: string` | Register and use custom font |
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
| `printing` | `string \| boolean` | `'highResolution'`, `'lowResolution'`, `false` |
| `modifying` | `boolean` | Allow content modification |
| `copying` | `boolean` | Allow content copying |
| `annotating` | `boolean` | Allow annotations |
| `fillingForms` | `boolean` | Allow form filling |
| `contentAccessibility` | `boolean` | Allow accessibility extraction |
| `documentAssembly` | `boolean` | Allow page assembly |

#### WatermarkOptions

| Property | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `number` | `60` | Watermark font size |
| `color` | `string` | `'#cccccc'` | Watermark color |
| `opacity` | `number` | `0.15` | Opacity (0–1) |
| `angle` | `number` | `-45` | Rotation in degrees |
| `font` | `string` | `'Helvetica'` | Font name |

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

## TypeScript

The package includes complete type definitions. No additional `@types` package is needed.

```typescript
import { SecurePDF, type SaveResult, type PermissionsConfig } from 'secure-pdf';

const perms: PermissionsConfig = {
  printing: 'lowResolution',
  copying: false,
};

const pdf = new SecurePDF();
pdf.addText('Typed document').permissions(perms);
const result: SaveResult = await pdf.save('typed.pdf');
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
