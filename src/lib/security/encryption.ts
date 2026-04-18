import "server-only";

const ENCRYPTION_KEY_ENV_NAME = "APP_DATA_ENCRYPTION_KEY";

/**
 * Returns the runtime encryption key used by DB RPCs.
 *
 * This key must only be used on trusted server code paths.
 */
export function getAppDataEncryptionKey(): string {
  const key = process.env.APP_DATA_ENCRYPTION_KEY;

  if (!key || key.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${ENCRYPTION_KEY_ENV_NAME}`,
    );
  }

  return key;
}
