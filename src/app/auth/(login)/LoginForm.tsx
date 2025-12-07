"use client";

import type React from "react";
import SubmitButton from "@/components/form/SubmitButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardHeader>Login</CardHeader>
        <CardContent>
          <FieldGroup>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  type="email"
                  placeholder="Enter Email"
                  label="Email"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  type="password"
                  placeholder="Enter Password"
                  label="Password"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <form.AppForm>
            <form.SubmitButton
              isSubmittingLabel="Logging in"
              label="Login"
              className="w-full"
            />
          </form.AppForm>
        </CardFooter>
      </form>
    </Card>
  );
};
