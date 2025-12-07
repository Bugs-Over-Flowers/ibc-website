"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { useLogin } from "@/hooks/useLogin";

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
      <CardHeader>Login</CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <form.AppField name="email">
              {(field) => (
                <FieldSet>
                  <FieldLabel>Email</FieldLabel>
                  <field.TextField type="email" placeholder="Enter Email" />
                </FieldSet>
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <FieldSet>
                  <FieldLabel>Password</FieldLabel>
                  <field.TextField
                    type="password"
                    placeholder="Enter Password"
                  />
                </FieldSet>
              )}
            </form.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          )}
        </form.Subscribe>
      </CardFooter>
    </Card>
  );
};
