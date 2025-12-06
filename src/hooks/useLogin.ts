import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/server/login";
import { zodValidator } from "@/lib/utils";
import { LoginSchema } from "@/lib/validation/authentication/login";
import { useAppForm } from "./_formHooks";

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
      const [error, data] = await login(value);

      if (error) {
        toast.error(error);
        return;
      }

      if (data?.mfaRequired) {
        router.push("/admin/mfa-verify");
      } else {
        toast.success("Logged in successfully");
        router.push("/admin/dashboard");
      }
    },
  });

  return form;
};
