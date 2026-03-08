export { SecurePDF } from './core/SecurePDF.js';
export { PDFBuilder } from './core/PDFBuilder.js';
export { ValidationEngine } from './core/ValidationEngine.js';

export { applyEncryption } from './features/encryption.js';
export { buildPermissionFlags } from './features/permissions.js';
export { renderWatermark } from './features/watermark.js';
export { applyMetadata, serializeMetadata } from './features/metadata.js';
export { applyExpiration } from './features/expiration.js';
export { embedTracking, renderTrackingLayer } from './features/tracking.js';
export { renderForensicWatermark } from './features/forensics.js';
export { renderQRVerification } from './features/qr-verification.js';
export {
  computeContentHash,
  embedContentHash,
  renderIntegritySeal,
  verifyContentHash,
} from './features/tamper-detection.js';

export {
  SecurePDFError,
  ValidationError,
  EncryptionError,
  BuildError,
  FeatureError,
} from './utils/errors.js';

export {
  sha256,
  sha256Multi,
  hmacSha256,
  generateDocumentId,
} from './utils/crypto.js';
