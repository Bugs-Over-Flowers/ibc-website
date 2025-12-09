import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodValidator } from "@/lib/utils";
import { SignupSchema } from "@/lib/validation/authentication/signup";
import { signup } from "@/server/auth/mutations/signup";
import { useAppForm } from "../_formHooks";

export const useSignUp = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: zodValidator(SignupSchema),
    },
    onSubmit: async ({ value }) => {
      const res = await signup(value);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      const data = res.data;

      if (data?.sessionCreated) {
        toast.success("Sign up successful!");
        router.push("/auth/mfa-setup");
      } else {
        toast.success("Sign up successful! Please check your email.");
        router.push("/auth/signup/verify-email");
      }
    },
  });

  return form;
};
