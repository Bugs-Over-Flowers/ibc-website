"use server";

import { StandardRegistrationSchema } from "@/lib/validation/registration/standard";

export const submitRegistration = async (data: StandardRegistrationSchema) => {
  const parsedData = StandardRegistrationSchema.parse(data);

  console.log("Full registration data:", parsedData);

  console.log("other registrants:", parsedData.step2.otherRegistrants);

  return;
};
