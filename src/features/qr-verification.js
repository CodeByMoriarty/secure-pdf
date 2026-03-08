import QRCode from 'qrcode';

export async function renderQRVerification(doc, baseUrl, options = {}) {
  const docHash = doc.info['ContentHash'] || doc.info['TrackingID'] || '';
  const verifyUrl = docHash ? `${baseUrl}?hash=${docHash}` : baseUrl;

  const size = options.size ?? 80;
  const { width, height } = doc.page;
  const x = options.x ?? width - size - 40;
  const y = options.y ?? height - size - 80;

  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    type: 'png',
    width: size * 3,
    margin: 1,
    errorCorrectionLevel: 'H',
  });

  doc.image(qrBuffer, x, y, { width: size, height: size });

  doc.save();
  doc.fontSize(6);
  doc.font('Helvetica');
  doc.fillColor('#666666');
  doc.text('Scan to verify authenticity', x - 5, y + size + 3, {
    width: size + 10,
    align: 'center',
    lineBreak: true,
  });
  doc.restore();
}
