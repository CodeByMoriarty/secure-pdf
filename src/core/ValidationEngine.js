import { ValidationError } from '../utils/errors.js';
import { parseDate, isFutureDate } from '../utils/date.js';

const PRINTING_VALUES = new Set(['highResolution', 'lowResolution', true, false]);
const PERMISSION_KEYS = new Set(['printing', 'modifying', 'copying', 'annotating', 'fillingForms', 'contentAccessibility', 'documentAssembly']);
const METADATA_KEYS = new Set(['title', 'author', 'subject', 'keywords', 'creator', 'producer', 'company', 'classification']);

export class ValidationEngine {
  static text(value, options = {}) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new ValidationError('Text content must be a non-empty string.', 'text');
    }
    if (options.fontSize !== undefined && (typeof options.fontSize !== 'number' || options.fontSize <= 0)) {
      throw new ValidationError('fontSize must be a positive number.', 'fontSize');
    }
  }

  static password(value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new ValidationError('Password must be a non-empty string.', 'password');
    }
    if (value.length < 1) {
      throw new ValidationError('Password must be at least 1 character.', 'password');
    }
  }

  static permissions(config) {
    if (!config || typeof config !== 'object') {
      throw new ValidationError('Permissions must be an object.', 'permissions');
    }
    for (const key of Object.keys(config)) {
      if (!PERMISSION_KEYS.has(key)) {
        throw new ValidationError(`Unknown permission: "${key}".`, 'permissions');
      }
    }
    if (config.printing !== undefined && !PRINTING_VALUES.has(config.printing)) {
      throw new ValidationError(
        'printing must be "highResolution", "lowResolution", true, or false.',
        'permissions.printing',
      );
    }
    for (const key of ['modifying', 'copying', 'annotating', 'fillingForms', 'contentAccessibility', 'documentAssembly']) {
      if (config[key] !== undefined && typeof config[key] !== 'boolean') {
        throw new ValidationError(`${key} must be a boolean.`, `permissions.${key}`);
      }
    }
  }

  static metadata(config) {
    if (!config || typeof config !== 'object') {
      throw new ValidationError('Metadata must be an object.', 'metadata');
    }
    for (const key of Object.keys(config)) {
      if (!METADATA_KEYS.has(key)) {
        throw new ValidationError(`Unknown metadata field: "${key}".`, 'metadata');
      }
    }
    if (config.keywords && !Array.isArray(config.keywords) && typeof config.keywords !== 'string') {
      throw new ValidationError('keywords must be a string or string array.', 'metadata.keywords');
    }
  }

  static expirationDate(value) {
    const date = parseDate(value);
    if (!date) {
      throw new ValidationError(`Invalid date: "${value}".`, 'expire');
    }
    if (!isFutureDate(value)) {
      throw new ValidationError('Expiration date must be in the future.', 'expire');
    }
  }

  static trackingId(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError('Tracking ID must be a non-empty string.', 'track');
    }
  }

  static url(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError('URL must be a non-empty string.', 'url');
    }
    try {
      new URL(value);
    } catch {
      throw new ValidationError(`Invalid URL: "${value}".`, 'url');
    }
  }

  static filePath(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError('File path must be a non-empty string.', 'filePath');
    }
  }

  static imageSource(value) {
    if (!value) {
      throw new ValidationError('Image source is required.', 'image');
    }
    if (typeof value !== 'string' && !Buffer.isBuffer(value)) {
      throw new ValidationError('Image source must be a file path or Buffer.', 'image');
    }
  }

  static tableData(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError('Table requires a non-empty array of rows.', 'table');
    }
    for (const row of rows) {
      if (!Array.isArray(row)) {
        throw new ValidationError('Each table row must be an array.', 'table');
      }
    }
  }

  static watermark(text) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new ValidationError('Watermark text must be a non-empty string.', 'watermark');
    }
  }

  static forensicConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new ValidationError('Forensic watermark config must be an object.', 'forensicWatermark');
    }
  }
}
