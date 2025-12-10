"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useLogin } from "@/hooks/auth/useLogin";

export const LoginForm = () => {
  const form = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit();
  };

  return (
    <Card className="w-full max-w-[400px]">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <CardHeader>Login</CardHeader>
        <CardContent>
          <FieldGroup>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  placeholder="Enter Email"
                  type="email"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label="Password"
                  placeholder="Enter Password"
                  type="password"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <form.AppForm>
            <form.SubmitButton
              className="w-full"
              isSubmittingLabel="Logging in"
              label="Login"
            />
          </form.AppForm>
        </CardFooter>
      </form>
    </Card>
  );
};
