import fs from 'node:fs';
import path from 'node:path';
import { PDFBuilder } from './PDFBuilder.js';
import { ValidationEngine } from './ValidationEngine.js';
import { generateDocumentId } from '../utils/crypto.js';

export class SecurePDF {
  #contentQueue = [];
  #password = null;
  #permissions = null;
  #metadata = null;
  #watermark = null;
  #expirationDate = null;
  #trackingId = null;
  #forensic = null;
  #qrUrl = null;
  #qrOptions = {};
  #tamperDetect = false;
  #tamperSalt = '';
  #pageSize = 'A4';
  #margins = { top: 50, bottom: 50, left: 50, right: 50 };
  #documentId;

  constructor(options = {}) {
    this.#documentId = options.documentId || generateDocumentId();
    if (options.pageSize) this.#pageSize = options.pageSize;
    if (options.margins) this.#margins = { ...this.#margins, ...options.margins };
  }

  get documentId() {
    return this.#documentId;
  }

  // --- Content ---

  addText(text, options = {}) {
    ValidationEngine.text(text, options);
    this.#contentQueue.push({ type: 'text', data: { text, options } });
    return this;
  }

  addPage(options = {}) {
    this.#contentQueue.push({ type: 'page', options });
    return this;
  }

  addImage(source, options = {}) {
    ValidationEngine.imageSource(source);
    this.#contentQueue.push({ type: 'image', data: { source, options } });
    return this;
  }

  addTable(rows, options = {}) {
    ValidationEngine.tableData(rows);
    this.#contentQueue.push({ type: 'table', data: { rows, options } });
    return this;
  }

  setFont(name, fontPath) {
    this.#contentQueue.push({ type: 'font', data: { name, path: fontPath } });
    return this;
  }

  moveDown(lines = 1) {
    this.#contentQueue.push({ type: 'moveDown', data: lines });
    return this;
  }

  // --- Security ---

  encrypt(password) {
    ValidationEngine.password(password);
    this.#password = password;
    return this;
  }

  permissions(config) {
    ValidationEngine.permissions(config);
    this.#permissions = config;
    return this;
  }

  metadata(config) {
    ValidationEngine.metadata(config);
    this.#metadata = config;
    return this;
  }

  watermark(text, options = {}) {
    ValidationEngine.watermark(text);
    this.#watermark = { text, options };
    return this;
  }

  expire(date) {
    ValidationEngine.expirationDate(date);
    this.#expirationDate = date;
    return this;
  }

  track(id) {
    ValidationEngine.trackingId(id);
    this.#trackingId = id;
    return this;
  }

  forensicWatermark(config = {}) {
    ValidationEngine.forensicConfig(config);
    this.#forensic = config;
    return this;
  }

  qrVerify(url, options = {}) {
    ValidationEngine.url(url);
    this.#qrUrl = url;
    this.#qrOptions = options;
    return this;
  }

  tamperDetect(enableOrSalt = true) {
    this.#tamperDetect = true;
    if (typeof enableOrSalt === 'string') {
      this.#tamperSalt = enableOrSalt;
    }
    return this;
  }

  // --- Output ---

  async toBuffer() {
    const builder = new PDFBuilder(this.#buildConfig(), this.#contentQueue);
    const { buffer, contentHash } = await builder.build();
    return { buffer, contentHash, trackingId: this.#trackingId, documentId: this.#documentId };
  }

  async save(filePath) {
    ValidationEngine.filePath(filePath);
    const resolved = path.resolve(filePath);
    const dir = path.dirname(resolved);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const result = await this.toBuffer();
    fs.writeFileSync(resolved, result.buffer);

    return {
      path: resolved,
      size: result.buffer.length,
      documentId: this.#documentId,
      contentHash: result.contentHash,
      trackingId: result.trackingId,
    };
  }

  // --- Internal ---

  #buildConfig() {
    return {
      pageSize: this.#pageSize,
      margins: this.#margins,
      password: this.#password,
      permissions: this.#permissions,
      metadata: this.#metadata,
      watermark: this.#watermark,
      expirationDate: this.#expirationDate,
      trackingId: this.#trackingId,
      forensic: this.#forensic,
      qrUrl: this.#qrUrl,
      qrOptions: this.#qrOptions,
      tamperDetect: this.#tamperDetect,
      tamperSalt: this.#tamperSalt,
      documentId: this.#documentId,
    };
  }
}
