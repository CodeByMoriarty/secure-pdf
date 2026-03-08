export class SecurePDFError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SecurePDFError';
    this.code = code;
  }
}

export class ValidationError extends SecurePDFError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class EncryptionError extends SecurePDFError {
  constructor(message) {
    super(message, 'ENCRYPTION_ERROR');
    this.name = 'EncryptionError';
  }
}

export class BuildError extends SecurePDFError {
  constructor(message) {
    super(message, 'BUILD_ERROR');
    this.name = 'BuildError';
  }
}

export class FeatureError extends SecurePDFError {
  constructor(feature, message) {
    super(`[${feature}] ${message}`, 'FEATURE_ERROR');
    this.name = 'FeatureError';
    this.feature = feature;
  }
}
