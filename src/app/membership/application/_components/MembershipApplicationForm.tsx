"use client";

import { useStore } from "@tanstack/react-form";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMembershipStep1 } from "@/app/membership/application/_hooks/useMembershipStep1";
import { useMembershipStep2 } from "@/app/membership/application/_hooks/useMembershipStep2";
import { useMembershipStep3 } from "@/app/membership/application/_hooks/useMembershipStep3";
import { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import CenterSpinner from "@/components/CenterSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import { cn } from "@/lib/utils";
import type { Sector } from "@/server/membership/queries/getSectors";
import { Step1Status } from "./forms/Step1Status";
import { Step2Company } from "./forms/Step2Company";
import { Step3Representatives } from "./forms/Step3Representatives";
import { Step4Review } from "./forms/Step4Review";

const steps = [
  {
    id: 1,
    title: "Membership Status",
    description: "Select your membership type",
  },
  {
    id: 2,
    title: "Company Info",
    description: "Provide your company information",
  },
  {
    id: 3,
    title: "Representatives",
    description: "Add authorized representatives",
  },
  { id: 4, title: "Review & Submit", description: "Confirm and submit" },
];

interface MembershipApplicationFormProps {
  sectors: Sector[];
}

export function MembershipApplicationForm({
  sectors,
}: MembershipApplicationFormProps) {
  const router = useRouter();
  const currentStep = useMembershipApplicationStore((state) => state.step);
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const resetStore = useMembershipApplicationStore((state) => state.resetStore);

  const step1Form = useMembershipStep1();
  const step2Form = useMembershipStep2();
  const step3Form = useMembershipStep3();
  const {
    form: step4Form,
    goBack: step4GoBack,
    applicationData,
  } = useMembershipStep4();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = (
    form: typeof step1Form.form | typeof step2Form | typeof step3Form,
  ) => {
    form.handleSubmit({ nextStep: true });
    scrollToTop();
  };

  const handleBack = (targetStep: number) => {
    setStep(targetStep);
    scrollToTop();
  };

  const isSubmitting = useStore(step4Form.store, (state) => state.isSubmitting);
  const isSubmitted = useMembershipApplicationStore(
    (state) => state.isSubmitted,
  );

  if (isSubmitting || isSubmitted) {
    return <CenterSpinner scale={10} />;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Sidebar / Stepper */}
      <div className="w-full space-y-4 lg:w-1/4 lg:space-y-6">
        <Link href="/">
          <Button className="-ml-4" variant="ghost">
            <ChevronLeft />
            Back to Home
          </Button>
        </Link>
        <div className="space-y-2 lg:space-y-4">
          <h2 className="font-bold text-lg text-primary lg:text-xl">
            Iloilo Business Club
          </h2>
          <p className="text-muted-foreground text-xs lg:text-sm">
            Membership Application
          </p>
        </div>

        {/* Mobile Stepper - Horizontal */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          {steps.map((step, index) => (
            <div className="flex flex-1 items-center" key={step.id}>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-medium text-xs transition-colors",
                  currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-[2px] flex-1",
                    currentStep > step.id ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Desktop Stepper - Vertical */}
        <div className="relative hidden space-y-4 lg:block">
          {/* Progress Bar Background */}
          <div className="absolute top-2 bottom-2 left-[15px] -z-10 w-[2px] bg-muted" />

          {steps.map((step) => (
            <div
              className="relative flex items-start gap-4 bg-background"
              key={step.id}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-medium text-sm transition-colors",
                  currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="space-y-1 pt-1">
                <p
                  className={cn(
                    "font-medium text-sm leading-none",
                    currentStep === step.id
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="text-muted-foreground text-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1 */}
            {currentStep === 1 && (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext(step1Form.form);
                }}
              >
                <Step1Status
                  form={step1Form.form}
                  memberValidation={step1Form.memberValidation}
                  resetMemberValidation={step1Form.resetMemberValidation}
                />
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => {
                      resetStore();
                      router.push("/");
                    }}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <step1Form.form.Subscribe
                    selector={(state) => state.isSubmitting}
                  >
                    {(isSubmitting) => (
                      <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Saving..." : "Next"}
                      </Button>
                    )}
                  </step1Form.form.Subscribe>
                </div>
              </form>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext(step2Form);
                }}
              >
                <Step2Company form={step2Form} sectors={sectors} />
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => handleBack(1)}
                    type="button"
                    variant="outline"
                  >
                    Back
                  </Button>
                  <step2Form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Saving..." : "Next"}
                      </Button>
                    )}
                  </step2Form.Subscribe>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext(step3Form);
                }}
              >
                <Step3Representatives form={step3Form} />
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => handleBack(2)}
                    type="button"
                    variant="outline"
                  >
                    Back
                  </Button>
                  <step3Form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Saving..." : "Next"}
                      </Button>
                    )}
                  </step3Form.Subscribe>
                </div>
              </form>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await step4Form.handleSubmit();
                  scrollToTop();
                }}
              >
                <Step4Review
                  applicationData={applicationData}
                  form={step4Form}
                />
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => {
                      step4GoBack();
                      scrollToTop();
                    }}
                    type="button"
                    variant="outline"
                  >
                    Back
                  </Button>
                  <step4Form.AppForm>
                    <step4Form.SubmitButton
                      isSubmittingLabel="Submitting..."
                      label="Submit Application"
                    />
                  </step4Form.AppForm>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
