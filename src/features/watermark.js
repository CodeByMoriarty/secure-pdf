const WATERMARK_DEFAULTS = {
  fontSize: 60,
  color: '#cccccc',
  opacity: 0.15,
  angle: -45,
  font: 'Helvetica',
};

export function renderWatermark(doc, text, options = {}) {
  const config = { ...WATERMARK_DEFAULTS, ...options };
  const { width, height } = doc.page;

  doc.save();
  doc.opacity(config.opacity);
  doc.fontSize(config.fontSize);
  doc.font(config.font);
  doc.fillColor(config.color);

  const textWidth = doc.widthOfString(text);
  const textHeight = doc.currentLineHeight();
  const cx = width / 2;
  const cy = height / 2;

  doc.translate(cx, cy);
  doc.rotate(config.angle, { origin: [0, 0] });
  doc.text(text, -textWidth / 2, -textHeight / 2, { lineBreak: false });
  doc.restore();
}
