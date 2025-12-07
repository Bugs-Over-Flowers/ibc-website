import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signup } from "@/lib/server/signup";
import { zodValidator } from "@/lib/utils";
import { SignupSchema } from "@/lib/validation/authentication/signup";
import { useAppForm } from "./_formHooks";

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
      const [error, data] = await signup(value);

      if (error) {
        toast.error(error);
        return;
      }

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
