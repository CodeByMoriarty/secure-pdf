# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-08

### Added
- Core PDF generation with multi-page support, text, tables, and images
- AES-256 password encryption with user and owner passwords
- Granular permission control (printing, copying, modifying, annotating, forms, assembly)
- Custom watermarks with configurable text, font, size, color, opacity, and angle
- Document metadata (title, author, subject, keywords, company, classification)
- Self-destruct expiration via embedded JavaScript and visible notices
- View tracking with unique ID embedding in metadata and hidden page layers
- Forensic watermarking with steganographic-style invisible patterns
- QR code verification embedding with SHA-256 hash URL parameters
- Tamper detection with SHA-256 content hashing and integrity verification
- Fluent chainable API for all operations
- Full TypeScript type definitions
- Custom error classes for structured error handling
- Input validation on all public methods
- Three working examples (basic, advanced, enterprise)
- Unit and integration test suite (Jest)
