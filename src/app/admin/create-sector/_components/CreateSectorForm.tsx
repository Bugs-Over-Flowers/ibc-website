"use client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formContext } from "@/hooks/_formHooks";
import { useCreateSectorForm } from "../_hooks/useCreateSectorForm";

const CreateSectorForm = () => {
  const { router, form } = useCreateSectorForm();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-0">
      <Button
        className="mb-2"
        onClick={() => router.push("/admin")}
        type="button"
        variant="ghost"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <h2 className="mt-8 mb-2 font-bold text-2xl">Create New Sector</h2>
      <p className="mb-6 text-lg">
        Fill in the details to create a new sector.
      </p>

      <div className="min-h-screen rounded-lg">
        <formContext.Provider value={form}>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.AppField name="sectorName">
              {(field) => (
                <field.TextField
                  label={
                    <span>
                      Sector Name <span className="text-destructive">*</span>
                    </span>
                  }
                  placeholder="Enter sector name"
                />
              )}
            </form.AppField>

            <form.AppForm>
              <form.SubmitButton
                isSubmittingLabel="Creating..."
                label="Create Sector"
              />
            </form.AppForm>
          </form>
        </formContext.Provider>
      </div>
    </div>
  );
};

export default CreateSectorForm;
