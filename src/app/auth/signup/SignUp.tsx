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
import { useSignUp } from "@/hooks/useSignUp";

export const SignUpForm = () => {
  const form = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit();
  };

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader>Sign Up</CardHeader>
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
            <form.AppField name="confirmPassword">
              {(field) => (
                <FieldSet>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <field.TextField
                    type="password"
                    placeholder="Confirm Password"
                  />
                </FieldSet>
              )}
            </form.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Sign Up
        </Button>
      </CardFooter>
    </Card>
  );
};
