import PDFDocument from 'pdfkit';
import { BuildError } from '../utils/errors.js';
import { applyEncryption } from '../features/encryption.js';
import { buildPermissionFlags } from '../features/permissions.js';
import { applyMetadata } from '../features/metadata.js';
import { renderWatermark } from '../features/watermark.js';
import { applyExpiration } from '../features/expiration.js';
import { embedTracking, renderTrackingLayer } from '../features/tracking.js';
import { renderForensicWatermark } from '../features/forensics.js';
import { renderQRVerification } from '../features/qr-verification.js';
import {
  computeContentHash,
  embedContentHash,
  renderIntegritySeal,
} from '../features/tamper-detection.js';

export class PDFBuilder {
  #config;
  #contentQueue;

  constructor(config, contentQueue) {
    this.#config = config;
    this.#contentQueue = contentQueue;
  }

  async build() {
    const docOptions = this.#prepareDocOptions();
    const doc = new PDFDocument(docOptions);
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    if (this.#config.metadata) {
      applyMetadata(doc, this.#config.metadata);
    }

    if (this.#config.trackingId) {
      embedTracking(doc, this.#config.trackingId);
    }

    const textParts = this.#renderContent(doc);
    let contentHash = null;

    if (this.#config.tamperDetect) {
      contentHash = computeContentHash(textParts, this.#config.tamperSalt);
      embedContentHash(doc, contentHash);
    }

    this.#applyPageFeatures(doc, contentHash);

    if (this.#config.qrUrl) {
      const pageCount = doc.bufferedPageRange().count;
      doc.switchToPage(pageCount - 1);
      await renderQRVerification(doc, this.#config.qrUrl, this.#config.qrOptions);
    }

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentHash }));
      doc.on('error', (err) => reject(new BuildError(`PDF generation failed: ${err.message}`)));
      doc.end();
    });
  }

  #prepareDocOptions() {
    const opts = {
      size: this.#config.pageSize || 'A4',
      margins: this.#config.margins || { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
      autoFirstPage: true,
      info: {},
    };

    if (this.#config.password) {
      const permFlags = this.#config.permissions
        ? buildPermissionFlags(this.#config.permissions)
        : {};
      applyEncryption(opts, this.#config.password, permFlags);
    }

    return opts;
  }

  #renderContent(doc) {
    const textParts = [];

    for (const item of this.#contentQueue) {
      switch (item.type) {
        case 'text':
          this.#renderText(doc, item.data, textParts);
          break;
        case 'page':
          doc.addPage(item.options || {});
          break;
        case 'image':
          this.#renderImage(doc, item.data);
          break;
        case 'table':
          this.#renderTable(doc, item.data, textParts);
          break;
        case 'font':
          doc.registerFont(item.data.name, item.data.path);
          doc.font(item.data.name);
          break;
        case 'moveDown':
          doc.moveDown(item.data || 1);
          break;
      }
    }

    return textParts;
  }

  #renderText(doc, data, textParts) {
    const { text, options = {} } = data;

    if (options.font) doc.font(options.font);
    else if (options.bold) doc.font('Helvetica-Bold');
    else if (options.italic) doc.font('Helvetica-Oblique');

    if (options.fontSize) doc.fontSize(options.fontSize);
    if (options.color) doc.fillColor(options.color);

    const pdfkitOpts = {};
    if (options.align) pdfkitOpts.align = options.align;
    if (options.width) pdfkitOpts.width = options.width;
    if (options.lineBreak !== undefined) pdfkitOpts.lineBreak = options.lineBreak;
    if (options.underline) pdfkitOpts.underline = true;
    if (options.link) pdfkitOpts.link = options.link;
    if (options.indent) pdfkitOpts.indent = options.indent;

    doc.text(text, pdfkitOpts);

    // Reset to default after styled text
    if (options.bold || options.italic || options.font) doc.font('Helvetica');
    if (options.color) doc.fillColor('#000000');

    textParts.push(text);
  }

  #renderImage(doc, data) {
    const { source, options = {} } = data;
    const imgOpts = {};

    if (options.width) imgOpts.width = options.width;
    if (options.height) imgOpts.height = options.height;
    if (options.fit) imgOpts.fit = options.fit;
    if (options.align) imgOpts.align = options.align;
    if (options.valign) imgOpts.valign = options.valign;

    if (options.x !== undefined && options.y !== undefined) {
      doc.image(source, options.x, options.y, imgOpts);
    } else {
      doc.image(source, imgOpts);
    }
  }

  #renderTable(doc, data, textParts) {
    const { rows, options = {} } = data;
    if (!rows || rows.length === 0) return;

    const fontSize = options.fontSize ?? 10;
    const headerBg = options.headerBackground ?? '#eeeeee';
    const headerColor = options.headerColor ?? '#333333';
    const cellColor = options.cellColor ?? '#000000';
    const borderColor = options.borderColor ?? '#cccccc';

    const isFirstRowHeader = rows.length > 1;
    const colCount = Math.max(...rows.map((r) => r.length));
    const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = options.columnWidth ?? tableWidth / colCount;
    const rowHeight = fontSize + 14;
    const startX = doc.page.margins.left;
    let cursorY = doc.y + 5;

    doc.fontSize(fontSize);

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      const isHeader = isFirstRowHeader && ri === 0;

      if (isHeader) {
        doc.save();
        doc.rect(startX, cursorY, colCount * colWidth, rowHeight).fillColor(headerBg).fill();
        doc.restore();
      }

      for (let ci = 0; ci < row.length; ci++) {
        const cellX = startX + ci * colWidth;
        doc.fillColor(isHeader ? headerColor : cellColor);
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
        doc.text(String(row[ci]), cellX + 5, cursorY + 5, {
          width: colWidth - 10,
          height: rowHeight - 4,
          lineBreak: false,
        });
        textParts.push(String(row[ci]));
      }

      doc.save();
      doc.strokeColor(borderColor).lineWidth(0.5);
      doc.rect(startX, cursorY, colCount * colWidth, rowHeight).stroke();
      doc.restore();

      cursorY += rowHeight;

      if (cursorY + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        cursorY = doc.page.margins.top;
      }
    }

    doc.x = doc.page.margins.left;
    doc.y = cursorY + 10;
  }

  #applyPageFeatures(doc, contentHash) {
    const { count } = doc.bufferedPageRange();

    for (let i = 0; i < count; i++) {
      doc.switchToPage(i);

      if (this.#config.watermark) {
        renderWatermark(doc, this.#config.watermark.text, this.#config.watermark.options);
      }

      if (this.#config.trackingId) {
        renderTrackingLayer(doc, this.#config.trackingId);
      }

      if (this.#config.forensic) {
        renderForensicWatermark(doc, this.#config.forensic);
      }

      if (this.#config.tamperDetect && contentHash && i === 0) {
        renderIntegritySeal(doc, contentHash);
      }

      if (this.#config.expirationDate) {
        applyExpiration(doc, this.#config.expirationDate);
      }
    }
  }
}
