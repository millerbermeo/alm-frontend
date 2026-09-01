import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * AES-256-GCM helpers for small secrets stored in a cookie. Pure (secret is a
 * parameter) so it can be unit-tested without the server env.
 *
 * Token layout (base64url): [16B salt][12B iv][16B tag][ciphertext]
 */
const ALGO = "aes-256-gcm";
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;

function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, 32);
}

export function encryptJsonWith(secret: string, value: unknown): string {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, deriveKey(secret, salt), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([salt, iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

export function decryptJsonWith<T>(secret: string, token: string): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < SALT_LEN + IV_LEN + TAG_LEN + 1) return null;
    const salt = raw.subarray(0, SALT_LEN);
    const iv = raw.subarray(SALT_LEN, SALT_LEN + IV_LEN);
    const tag = raw.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
    const ciphertext = raw.subarray(SALT_LEN + IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, deriveKey(secret, salt), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch {
    return null;
  }
}
