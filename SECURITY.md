# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x.x | ✅ Yes |

## Reporting a Vulnerability

If you discover a security vulnerability in `secure-pdf`, **please do not open a public GitHub issue**. Instead, report it responsibly using one of the methods below:

**Email:** [alacambradev@gmail.com](mailto:alacambradev@gmail.com)

Please include the following in your report:

- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact you identified
- Any suggested fixes (optional but appreciated)

### Response Timeline

| Stage | Timeframe |
|---|---|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Patch / fix release | Within 30 days (critical: faster) |

You will be credited in the release notes unless you prefer to remain anonymous.

## Security Scope

This policy covers:

- The `secure-pdf` npm package source code (`src/`)
- Cryptographic utilities (`src/utils/crypto.js`)
- Encryption implementation (`src/features/encryption.js`)
- Tamper detection logic (`src/features/tamper-detection.js`)

**Out of scope:**

- Vulnerabilities in third-party dependencies (`pdfkit`, `qrcode`) — please report those directly to their maintainers
- PDF readers or viewers that execute embedded PDF JavaScript
- Issues in the `examples/` or `tests/` directories

## Security Design Notes

- Owner passwords are generated with `crypto.randomBytes(32)` never derived from the user password
- Password comparisons use `crypto.timingSafeEqual` to prevent timing attacks
- Content hashes use SHA-256 via Node.js built-in `crypto` no third-party crypto libraries
- The `forensicWatermark` and `track` features are forensic aids only; they do not replace server-side access control

## Disclosure Policy

We follow [Coordinated Vulnerability Disclosure (CVD)](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html). Please give us a reasonable window to address the issue before public disclosure.
