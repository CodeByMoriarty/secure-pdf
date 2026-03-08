export function applyMetadata(doc, config = {}) {
  if (config.title) doc.info.Title = config.title;
  if (config.author) doc.info.Author = config.author;
  if (config.subject) doc.info.Subject = config.subject;
  if (config.creator) doc.info.Creator = config.creator;
  if (config.producer) doc.info.Producer = config.producer;

  if (config.keywords) {
    doc.info.Keywords = Array.isArray(config.keywords)
      ? config.keywords.join(', ')
      : config.keywords;
  }

  if (config.company) doc.info['Company'] = config.company;
  if (config.classification) doc.info['Classification'] = config.classification;

  doc.info.CreationDate = new Date();
  doc.info.ModDate = new Date();
  doc.info.Producer = doc.info.Producer || 'secure-pdf';
}

export function serializeMetadata(config = {}) {
  const keys = Object.keys(config).sort();
  const normalized = {};
  for (const key of keys) {
    normalized[key] = Array.isArray(config[key]) ? config[key].join(',') : config[key];
  }
  return JSON.stringify(normalized);
}
