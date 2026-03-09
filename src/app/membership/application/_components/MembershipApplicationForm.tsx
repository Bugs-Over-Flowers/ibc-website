"use client";

import { useStore } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Step1Status } from "@/app/membership/application/_components/forms/Step1Status";
import { Step2Company } from "@/app/membership/application/_components/forms/Step2Company";
import { Step3Representatives } from "@/app/membership/application/_components/forms/Step3Representatives";
import { Step4Review } from "@/app/membership/application/_components/forms/Step4Review";
import { Step5Payment } from "@/app/membership/application/_components/forms/Step5Payment";
import { MembershipStepper } from "@/app/membership/application/_components/MembershipStepper";
import { useMembershipStep1 } from "@/app/membership/application/_hooks/useMembershipStep1";
import { useMembershipStep2 } from "@/app/membership/application/_hooks/useMembershipStep2";
import { useMembershipStep3 } from "@/app/membership/application/_hooks/useMembershipStep3";
import { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import CenterSpinner from "@/components/CenterSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import type { Sector } from "@/server/membership/queries/getSectors";

const steps = [
  {
    id: 1,
    title: "Status",
    description: "Select membership type",
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Company",
    description:
      "Provide your company details for verification and correspondence.",
    icon: Building2,
  },
  {
    id: 3,
    title: "Representatives",
    description:
      "The first representative is the principal member. You may add alternate representatives as needed.",
    icon: Users,
  },
  {
    id: 4,
    title: "Review",
    description:
      "Review all your application details before proceeding to payment.",
    icon: CheckCircle2,
  },
  {
    id: 5,
    title: "Payment",
    description:
      "Choose your payment method and upload proof of payment before final submission.",
    icon: CreditCard,
  },
];

interface MembershipApplicationFormProps {
  sectors: Sector[];
}

interface MembershipStepCardProps {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

function MembershipStepCard({
  children,
  description,
  icon: Icon,
  title,
}: MembershipStepCardProps) {
  return (
    <Card className="w-full overflow-hidden rounded-2xl bg-transparent shadow-none ring-0">
      <CardHeader className="border-border/30 border-b bg-card/5 pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 font-semibold text-xl sm:text-2xl">
          <Icon className="h-6 w-6 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-0 sm:px-6">{children}</CardContent>
    </Card>
  );
}

export function MembershipApplicationForm({
  sectors,
}: MembershipApplicationFormProps) {
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
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleNext = async (
    form: typeof step1Form.form | typeof step2Form | typeof step3Form,
  ) => {
    const stepBefore = useMembershipApplicationStore.getState().step;
    await form.handleSubmit({ nextStep: true });
    const stepAfter = useMembershipApplicationStore.getState().step;
    if (stepAfter !== stepBefore) {
      scrollToTop();
    }
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

  const currentStepMeta = steps[currentStep - 1];

  const stepContent =
    currentStep === 1 ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext(step1Form.form);
        }}
      >
        <MembershipStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step1Status
            form={step1Form.form}
            memberValidation={step1Form.memberValidation}
            resetMemberValidation={step1Form.resetMemberValidation}
          />
          <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full rounded-xl sm:w-auto"
              onClick={() => {
                resetStore();
                window.location.assign("/");
              }}
              size="lg"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <step1Form.form.Subscribe selector={(state) => state.isSubmitting}>
              {(nextSubmitting) => (
                <Button
                  className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
                  disabled={nextSubmitting}
                  size="lg"
                  type="submit"
                >
                  {nextSubmitting ? "Saving..." : "Continue to Company"}
                  {!nextSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </step1Form.form.Subscribe>
          </div>
        </MembershipStepCard>
      </form>
    ) : currentStep === 2 ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext(step2Form);
        }}
      >
        <MembershipStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step2Company form={step2Form} sectors={sectors} />
          <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full rounded-xl sm:w-auto"
              onClick={() => handleBack(1)}
              size="lg"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <step2Form.Subscribe selector={(state) => state.isSubmitting}>
              {(nextSubmitting) => (
                <Button
                  className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
                  disabled={nextSubmitting}
                  size="lg"
                  type="submit"
                >
                  {nextSubmitting ? "Saving..." : "Continue to Representatives"}
                  {!nextSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </step2Form.Subscribe>
          </div>
        </MembershipStepCard>
      </form>
    ) : currentStep === 3 ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext(step3Form);
        }}
      >
        <MembershipStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step3Representatives form={step3Form} />
          <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full rounded-xl sm:w-auto"
              onClick={() => handleBack(2)}
              size="lg"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <step3Form.Subscribe selector={(state) => state.isSubmitting}>
              {(nextSubmitting) => (
                <Button
                  className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
                  disabled={nextSubmitting}
                  size="lg"
                  type="submit"
                >
                  {nextSubmitting ? "Saving..." : "Continue to Review"}
                  {!nextSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </step3Form.Subscribe>
          </div>
        </MembershipStepCard>
      </form>
    ) : currentStep === 4 ? (
      <MembershipStepCard
        description={currentStepMeta.description}
        icon={currentStepMeta.icon}
        title={currentStepMeta.title}
      >
        <Step4Review
          applicationData={applicationData}
          form={step4Form}
          sectors={sectors}
        />
        <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            className="w-full rounded-xl sm:w-auto"
            onClick={() => handleBack(3)}
            size="lg"
            type="button"
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
            onClick={() => handleBack(5)}
            size="lg"
            type="button"
          >
            Continue to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </MembershipStepCard>
    ) : (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await step4Form.handleSubmit();
          scrollToTop();
        }}
      >
        <MembershipStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step5Payment applicationData={applicationData} form={step4Form} />
          <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full rounded-xl sm:w-auto"
              onClick={() => {
                step4GoBack();
                scrollToTop();
              }}
              size="lg"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="w-full sm:w-auto">
              <step4Form.AppForm>
                <step4Form.SubmitButton
                  className="w-full rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:px-8"
                  isSubmittingLabel="Submitting..."
                  label={
                    <span className="inline-flex items-center gap-2">
                      Submit Application
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  }
                />
              </step4Form.AppForm>
            </div>
          </div>
        </MembershipStepCard>
      </form>
    );

  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background p-4 pb-2 shadow-xl sm:p-6 sm:pb-3 md:p-8 md:pb-4">
      <CardContent className="px-0">
        <MembershipStepper currentStep={currentStep} steps={steps} />
        <div className="mt-6 sm:mt-8">{stepContent}</div>
      </CardContent>
    </Card>
  );
}
