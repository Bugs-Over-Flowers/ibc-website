"use client";
import { ArrowLeft, Package } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formContext } from "@/hooks/_formHooks";
import { useCreateSectorForm } from "../_hooks/useCreateSectorForm";

const CreateSectorForm = () => {
  const { form } = useCreateSectorForm();
  const router = useRouter();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background p-4 pb-2 shadow-xl sm:p-6 sm:pb-3 md:p-8 md:pb-4">
      <formContext.Provider value={form}>
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card/5">
              <div className="border-border/30 border-b bg-card/5 p-4 pb-4 sm:p-6 sm:pb-6">
                <h2 className="flex items-center gap-2 font-semibold text-foreground text-xl sm:text-2xl">
                  <Package className="h-6 w-6 text-primary" />
                  Sector Information
                </h2>
                <p className="mt-2 text-muted-foreground text-sm">
                  Enter the details for the new sector classification.
                </p>
              </div>

              <div className="space-y-6 px-4 py-6 sm:px-6">
                <form.AppField name="sectorName">
                  {(field) => (
                    <field.TextField
                      label="Sector Name"
                      placeholder="Enter sector name"
                    />
                  )}
                </form.AppField>

                <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    className="w-full rounded-xl sm:w-auto"
                    onClick={() => router.push("/admin/manage-sector" as Route)}
                    size="lg"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>

                  <form.AppForm>
                    <form.SubmitButton
                      className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
                      isSubmittingLabel="Creating..."
                      label="Create Sector"
                    />
                  </form.AppForm>
                </div>
              </div>
            </div>
          </div>
        </form>
      </formContext.Provider>
    </div>
  );
};

export default CreateSectorForm;
