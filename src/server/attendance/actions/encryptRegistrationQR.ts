"use server";
import * as jose from "jose";
import {
  type RegistrationCheckInQRCodeDecodedData,
  RegistrationCheckInQRCodeDecodedSchema,
  RegistrationCheckInQRCodeEncodedSchema,
} from "@/lib/validation/qr/standard";
import { getDecodedQRSecret } from "../queries/getDecodedQRSecret";
export const encryptRegistrationQR = async (
  data: RegistrationCheckInQRCodeDecodedData,
) => {
  // validate the input data
  const parsedData = RegistrationCheckInQRCodeDecodedSchema.parse(data);

  // get key
  const decodedKey = getDecodedQRSecret();

  const token = await new jose.EncryptJWT(parsedData)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(decodedKey);

  const parsedEncodedString = RegistrationCheckInQRCodeEncodedSchema.parse({
    encodedString: token,
  });

  return parsedEncodedString;
};
