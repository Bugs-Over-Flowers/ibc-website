import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodValidator } from "@/lib/utils";
import { LoginSchema } from "@/lib/validation/authentication/login";
import { login } from "@/server/auth/mutations/login";
import { useAppForm } from "../../../../hooks/_formHooks";

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

      if (data?.mfaRequired) {
        router.push("/auth/mfa-verify");
      } else {
        router.push("/auth/mfa-setup");
      }
    },
  });

  return form;
};
