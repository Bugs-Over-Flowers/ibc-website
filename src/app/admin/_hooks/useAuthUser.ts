"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuthUser() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    }
    fetchUser();
  }, []);

  return { email };
}
