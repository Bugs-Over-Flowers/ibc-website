"use client";

import { useStore } from "@tanstack/react-form";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateManualMemberStep1 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep1";
import { useCreateManualMemberStep2 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep2";
import { useCreateManualMemberStep3 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep3";
import CenterSpinner from "@/components/CenterSpinner";
import { Button } from "@/components/ui/button";
import useCreateManualMemberStore from "@/hooks/createManualMember.store";
import { cn } from "@/lib/utils";
import { Step1Company } from "./Step1Company";
import { Step2Representative } from "./Step2Representative";
import { Step3Review } from "./Step3Review";

const steps = [
  {
    id: 1,
    title: "Company Info",
    description: "Provide company information",
  },
  {
    id: 2,
    title: "Representative",
    description: "Add primary representative",
  },
  { id: 3, title: "Review & Confirm", description: "Confirm and create" },
];

interface CreateManualMemberFormProps {
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

export function CreateManualMemberForm({
  sectors,
}: CreateManualMemberFormProps) {
  const router = useRouter();
  const currentStep = useCreateManualMemberStore((state) => state.step);
  const setStep = useCreateManualMemberStore((state) => state.setStep);

  const step1Form = useCreateManualMemberStep1();
  const step2Form = useCreateManualMemberStep2();
  const { form: step3Form, memberData } = useCreateManualMemberStep3();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = (targetStep: number) => {
    setStep(targetStep as 1 | 2 | 3);
    scrollToTop();
  };

  const isSubmitting = useStore(step3Form.store, (state) => state.isSubmitting);
  const isSubmitted = useCreateManualMemberStore((state) => state.isSubmitted);

  if (isSubmitting || isSubmitted) {
    return <CenterSpinner scale={10} />;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar / Stepper */}
        <div className="w-full space-y-4 lg:w-1/4 lg:space-y-6">
          <Link href="/admin/members">
            <Button className="-ml-4" variant="ghost">
              <ChevronLeft />
              Back to Members
            </Button>
          </Link>
          <div className="space-y-2 lg:space-y-4">
            <h2 className="font-bold text-lg text-primary lg:text-xl">
              Create Member
            </h2>
            <p className="text-muted-foreground text-xs lg:text-sm">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {steps.map((step) => (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                  currentStep === step.id
                    ? "bg-primary/10 text-primary"
                    : currentStep > step.id
                      ? "text-muted-foreground hover:bg-muted"
                      : "text-muted-foreground",
                )}
                key={step.id}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full font-semibold text-xs",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "border border-current",
                    )}
                  >
                    {step.id}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs opacity-75">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Form content will be rendered here */}
          {currentStep === 1 && (
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                step1Form.form.handleSubmit();
              }}
            >
              <Step1Company form={step1Form.form} sectors={sectors} />
              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => router.push("/admin/members")}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <step1Form.form.Subscribe
                  selector={(state) => [state.isSubmitting]}
                >
                  {([isSubmitting]) => (
                    <Button disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Loading..." : "Next"}
                    </Button>
                  )}
                </step1Form.form.Subscribe>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                step2Form.form.handleSubmit();
              }}
            >
              <Step2Representative form={step2Form.form} />
              <div className="flex justify-between gap-4">
                <Button
                  onClick={() => handleBack(1)}
                  type="button"
                  variant="outline"
                >
                  Back
                </Button>
                <step2Form.form.Subscribe
                  selector={(state) => [state.isSubmitting]}
                >
                  {([isSubmitting]) => (
                    <Button disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Loading..." : "Next"}
                    </Button>
                  )}
                </step2Form.form.Subscribe>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                step3Form.handleSubmit();
              }}
            >
              <Step3Review form={step3Form} memberData={memberData} />
              <div className="flex justify-between gap-4">
                <Button
                  onClick={() => handleBack(2)}
                  type="button"
                  variant="outline"
                >
                  Back
                </Button>
                <step3Form.Subscribe selector={(state) => [state.isSubmitting]}>
                  {([isSubmitting]) => (
                    <Button disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Creating..." : "Create Member"}
                    </Button>
                  )}
                </step3Form.Subscribe>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
