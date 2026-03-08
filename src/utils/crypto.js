import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

export function sha256Multi(parts, salt = '') {
  const hash = createHash('sha256');
  if (salt) hash.update(salt);
  for (const part of parts) hash.update(String(part));
  return hash.digest('hex');
}

export function hmacSha256(key, data) {
  return createHmac('sha256', key).update(data).digest('hex');
}

export function secureRandom(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function generateDocumentId() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `SPDOC-${timestamp}-${random}`.toUpperCase();
}
