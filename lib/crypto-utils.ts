import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

// Derive 32-byte encryption key consistently from master secret
function getMasterKey(): Buffer {
  const secret = process.env.APP_ENCRYPTION_KEY || 'serbaserbi-default-development-encryption-key-32b';
  // If hex string of 64 chars, parse directly; otherwise hash to 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }
  return createHash('sha256').update(secret).digest();
}

/**
 * Encrypt plain text using AES-256-GCM with a unique 96-bit IV per encryption.
 * Stored format: iv:authTag:ciphertext (all in hex).
 */
export function encryptApiKey(plainText: string): string {
  if (!plainText) return '';
  const iv = randomBytes(12);
  const key = getMasterKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted payload.
 */
export function decryptApiKey(payload: string): string {
  if (!payload) return '';
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Format payload enkripsi tidak valid.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getMasterKey();

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask API key for secure presentation in UI without exposing secret.
 * Example: "sk-or-v1-1234567890abcdef" -> "sk-or-v1-123...cdef"
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return '••••••••';
  const prefix = trimmed.slice(0, 8);
  const suffix = trimmed.slice(-4);
  return `${prefix}...${suffix}`;
}
