import "server-only";

import { getEnv } from "@/lib/utils";
import { Base64_32BitString } from "@/lib/validation/utils";

export const getDecodedQRSecret = () => {
  // get the QR secret key from environment variables
  const QR_SECRET_KEY = getEnv("QR_SECRET_KEY");

  // parse the base64 encoded key
  const parsed_secret_key = Base64_32BitString.parse(QR_SECRET_KEY);

  // convert to Buffer
  const decodedKey = Buffer.from(parsed_secret_key, "base64");

  return decodedKey;
};
