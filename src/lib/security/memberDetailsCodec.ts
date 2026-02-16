import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_PREFIX = "enc:v1";
const ENCRYPTION_KEY_ENV = "MEMBER_DETAILS_ENCRYPTION_KEY";
const IV_BYTE_LENGTH = 12;

const encryptedMemberDetailPattern =
  /^enc:v1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/;

const EncryptedMemberDetailSchema = z
  .string()
  .regex(
    encryptedMemberDetailPattern,
    "Invalid encrypted member detail format",
  );

let encryptionKeyCache: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (encryptionKeyCache) {
    return encryptionKeyCache;
  }

  const rawKey = process.env[ENCRYPTION_KEY_ENV];

  if (!rawKey) {
    throw new Error(
      `${ENCRYPTION_KEY_ENV} is required to encrypt or decrypt member details`,
    );
  }

  const keyBuffer = /^[A-Fa-f0-9]{64}$/.test(rawKey)
    ? Buffer.from(rawKey, "hex")
    : Buffer.from(rawKey, "base64");

  if (keyBuffer.length !== 32) {
    throw new Error(
      `${ENCRYPTION_KEY_ENV} must be a 32-byte key encoded as hex or base64`,
    );
  }

  encryptionKeyCache = keyBuffer;
  return encryptionKeyCache;
}

function encryptMemberDetailRaw(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTE_LENGTH);

  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}:${iv.toString("base64url")}:${authTag.toString("base64url")}:${encryptedBuffer.toString("base64url")}`;
}

function decryptMemberDetailRaw(encryptedValue: string): string {
  EncryptedMemberDetailSchema.parse(encryptedValue);

  const [prefix, version, ivEncoded, authTagEncoded, cipherEncoded] =
    encryptedValue.split(":");

  if (`${prefix}:${version}` !== ENCRYPTION_PREFIX) {
    throw new Error("Unsupported member detail encryption format");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivEncoded, "base64url");
  const authTag = Buffer.from(authTagEncoded, "base64url");
  const encryptedBuffer = Buffer.from(cipherEncoded, "base64url");

  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decryptedBuffer = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decryptedBuffer.toString("utf8");
}

export const memberDetailCodec = z.codec(
  z.string(),
  EncryptedMemberDetailSchema,
  {
    decode: (plainText) => encryptMemberDetailRaw(plainText),
    encode: (encryptedText) => decryptMemberDetailRaw(encryptedText),
  },
);

export function isEncryptedMemberDetail(value: string): boolean {
  return EncryptedMemberDetailSchema.safeParse(value).success;
}
