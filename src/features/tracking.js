export function embedTracking(doc, trackingId) {
  doc.info['TrackingID'] = trackingId;
  doc.info['SecurePDF-Track'] = trackingId;
}

export function renderTrackingLayer(doc, trackingId) {
  const { width, height } = doc.page;

  // Near-invisible scattered ID across the page
  doc.save();
  doc.opacity(0.015);
  doc.fontSize(6);
  doc.font('Helvetica');
  doc.fillColor('#aaaaaa');

  const stepX = 140;
  const stepY = 130;
  for (let y = 50; y < height - 40; y += stepY) {
    for (let x = 30; x < width - 30; x += stepX) {
      doc.text(`TRK:${trackingId}`, x, y, { lineBreak: false, continued: false });
    }
  }
  doc.restore();

  // Invisible selector text at page bottom
  doc.save();
  doc.opacity(0.008);
  doc.fontSize(3);
  doc.font('Helvetica');
  doc.fillColor('#ffffff');
  doc.text(`[TRACK:${trackingId}]`, 5, height - 8, {
    width: width - 10,
    align: 'left',
    lineBreak: false,
  });
  doc.restore();
}
