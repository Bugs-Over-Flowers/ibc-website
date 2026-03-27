"use client";

import { useStore } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCreateManualMemberStep1 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep1";
import { useCreateManualMemberStep2 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep2";
import { useCreateManualMemberStep3 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep3";
import { MembershipStepper } from "@/app/membership/application/_components/MembershipStepper";
import CenterSpinner from "@/components/CenterSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useCreateManualMemberStore from "@/hooks/createManualMember.store";
import { Step1Company } from "./Step1Company";
import { Step2Representative } from "./Step2Representative";
import { Step3Review } from "./Step3Review";

const steps = [
  {
    id: 1,
    title: "Company",
    description:
      "Provide company details, contact information, and initial membership settings.",
    icon: Building2,
  },
  {
    id: 2,
    title: "Representative",
    description:
      "Add the primary representative details for member records and communication.",
    icon: Users,
  },
  {
    id: 3,
    title: "Review",
    description: "Review all data before creating the member account.",
    icon: CheckCircle2,
  },
];

interface CreateManualMemberFormProps {
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

interface ManualMemberStepCardProps {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

function ManualMemberStepCard({
  children,
  description,
  icon: Icon,
  title,
}: ManualMemberStepCardProps) {
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
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleNext = async (
    form: typeof step1Form.form | typeof step2Form.form,
  ) => {
    const stepBefore = useCreateManualMemberStore.getState().step;
    await form.handleSubmit();
    const stepAfter = useCreateManualMemberStore.getState().step;

    if (stepAfter !== stepBefore) {
      scrollToTop();
    }
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
        <ManualMemberStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step1Company form={step1Form.form} sectors={sectors} />

          <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full rounded-xl sm:w-auto"
              onClick={() => router.push("/admin/members")}
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
                  {nextSubmitting ? "Saving..." : "Continue to Representative"}
                  {!nextSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </step1Form.form.Subscribe>
          </div>
        </ManualMemberStepCard>
      </form>
    ) : currentStep === 2 ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext(step2Form.form);
        }}
      >
        <ManualMemberStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step2Representative form={step2Form.form} />

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

            <step2Form.form.Subscribe selector={(state) => state.isSubmitting}>
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
            </step2Form.form.Subscribe>
          </div>
        </ManualMemberStepCard>
      </form>
    ) : (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          step3Form.handleSubmit();
        }}
      >
        <ManualMemberStepCard
          description={currentStepMeta.description}
          icon={currentStepMeta.icon}
          title={currentStepMeta.title}
        >
          <Step3Review form={step3Form} memberData={memberData} />

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
              {(submitPending) => (
                <Button
                  className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
                  disabled={submitPending}
                  size="lg"
                  type="submit"
                >
                  {submitPending ? "Creating..." : "Create Member"}
                  {!submitPending && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </step3Form.Subscribe>
          </div>
        </ManualMemberStepCard>
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
