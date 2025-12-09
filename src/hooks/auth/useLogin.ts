import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodValidator } from "@/lib/utils";
import { LoginSchema } from "@/lib/validation/authentication/login";
import { login } from "@/server/auth/mutations/login";
import { useAppForm } from "../_formHooks";

export const useLogin = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: zodValidator(LoginSchema),
    },
    onSubmit: async ({ value }) => {
      const res = await login(value);

      if (!res.success) {
        toast.error(
          res.error instanceof Error
            ? res.error.message
            : (res.error as string),
        );
        return;
      }

      const data = res.data;

      if (!data?.emailVerified) {
        toast.error("Please verify your email address.");
        // Cast to any to avoid stale type error for the new route
        router.push("/auth/signup/verify-email" as any);
        return;
      }

      if (data?.mfaRequired) {
        router.push("/auth/mfa-verify");
      } else {
        router.push("/auth/mfa-setup");
      }
    },
  });

  return form;
};
