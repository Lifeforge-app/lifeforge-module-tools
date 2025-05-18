import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

export function encrypt(data: Buffer, password: string): Buffer {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, encrypted]); // total = 16 + 12 + 16 + N
}

export function decrypt(encryptedData: Buffer, password: string): Buffer {
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const authTag = encryptedData.slice(28, 44);
  const ciphertext = encryptedData.slice(44);

  const key = scryptSync(password, salt, 32);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
