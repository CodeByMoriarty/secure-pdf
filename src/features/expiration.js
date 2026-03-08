import { toISODate } from '../utils/date.js';
import { sha256 } from '../utils/crypto.js';

export function applyExpiration(doc, date) {
  const isoDate = toISODate(date);
  if (!isoDate) return;

  embedExpirationJS(doc, isoDate);
  renderExpirationNotice(doc, isoDate);

  doc.info['ExpirationDate'] = isoDate;
  doc.info['ExpirationHash'] = sha256(`expire:${isoDate}`);
}

function embedExpirationJS(doc, isoDate) {
  const script = [
    `var expDate = new Date("${isoDate}T23:59:59Z");`,
    `if (new Date() > expDate) {`,
    `  app.alert("This document expired on ${isoDate}. It is no longer valid.", 1);`,
    `  this.closeDoc(true);`,
    `}`,
  ].join('\n');

  try {
    const actionRef = doc.ref({
      Type: 'Action',
      S: 'JavaScript',
      JS: new String(script),
    });
    actionRef.end();

    const nameTreeRef = doc.ref({
      Names: [new String('SecurePDF_Expiry'), actionRef],
    });
    nameTreeRef.end();

    const namesRef = doc.ref({ JavaScript: nameTreeRef });
    namesRef.end();

    doc._root.data.Names = namesRef;
  } catch {
    // pdfkit internals may change; the visible notice serves as fallback
  }
}

function renderExpirationNotice(doc, isoDate) {
  const { width, height } = doc.page;

  doc.save();
  doc.fontSize(9);
  doc.font('Helvetica-Bold');
  doc.fillColor('#cc0000');
  doc.text(
    `THIS DOCUMENT EXPIRES ON ${isoDate}. After this date it is no longer valid.`,
    40,
    height - 55,
    { width: width - 80, align: 'center', lineBreak: true },
  );
  doc.restore();
}
