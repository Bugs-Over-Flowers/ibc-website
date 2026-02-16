import "server-only";

import { createHmac } from "node:crypto";
import { z } from "zod";
import { memberDetailCodec } from "@/lib/security/memberDetailsCodec";

const IDENTIFIER_LOOKUP_HASH_SECRET_ENV = "IDENTIFIER_LOOKUP_HASH_SECRET";

let identifierHashSecretCache: Buffer | null = null;

function getIdentifierHashSecret(): Buffer {
  if (identifierHashSecretCache) {
    return identifierHashSecretCache;
  }

  const rawSecret = process.env[IDENTIFIER_LOOKUP_HASH_SECRET_ENV];

  if (!rawSecret) {
    throw new Error(
      `${IDENTIFIER_LOOKUP_HASH_SECRET_ENV} is required to compute identifier lookup hashes`,
    );
  }

  const secretBuffer = /^[A-Fa-f0-9]{64}$/.test(rawSecret)
    ? Buffer.from(rawSecret, "hex")
    : Buffer.from(rawSecret, "base64");

  if (secretBuffer.length !== 32) {
    throw new Error(
      `${IDENTIFIER_LOOKUP_HASH_SECRET_ENV} must be a 32-byte key encoded as hex or base64`,
    );
  }

  identifierHashSecretCache = secretBuffer;
  return identifierHashSecretCache;
}

export function computeIdentifierLookupHash(identifier: string): string {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const secret = getIdentifierHashSecret();
  return createHmac("sha256", secret)
    .update(normalizedIdentifier)
    .digest("hex");
}

const IdentifierSchema = z.string().regex(/^ibc-mem-[a-f0-9]{8}$/i);

export const identifierCodec = z.codec(IdentifierSchema, z.string(), {
  decode: (plainIdentifier) => memberDetailCodec.decode(plainIdentifier),
  encode: (encryptedIdentifier) =>
    memberDetailCodec.encode(encryptedIdentifier),
});

export function encryptIdentifier(plainIdentifier: string): string {
  return identifierCodec.decode(plainIdentifier);
}

export function decryptIdentifier(encryptedIdentifier: string): string {
  return identifierCodec.encode(encryptedIdentifier);
}

export function isEncryptedIdentifier(value: string): boolean {
  return value.startsWith("enc:v1:");
}

export function decryptIdentifierCompat(value: string): string {
  if (!isEncryptedIdentifier(value)) {
    return value;
  }

  try {
    return decryptIdentifier(value);
  } catch {
    return value;
  }
}
