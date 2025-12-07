"use server";

import { cookies } from "next/headers";

export const setCookieData = async (key: string, value: string) => {
  const cookieStore = await cookies();

  cookieStore.set(key, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14, // 7 days
  });
};
