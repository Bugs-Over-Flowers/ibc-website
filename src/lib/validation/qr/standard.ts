import z from "zod";

export const RegistrationIdentifier = z
  .string()
  .regex(/^ibc-reg-[a-zA-Z0-9]{8}$/);
