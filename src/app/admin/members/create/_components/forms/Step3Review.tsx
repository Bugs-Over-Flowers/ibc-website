import type { useCreateManualMemberStep3 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Step3ReviewProps {
  form: ReturnType<typeof useCreateManualMemberStep3>["form"];
  memberData: ReturnType<typeof useCreateManualMemberStep3>["memberData"];
}

export function Step3Review({ memberData }: Step3ReviewProps) {
  const step1 = memberData.step1;
  const step2 = memberData.step2;

  if (!step1 || !step2) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Error: Missing information</p>
        <p className="text-sm">Please go back and complete all steps.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Review & Confirm</h3>
        <p className="text-muted-foreground text-sm">
          Please review the information below before creating the member
        </p>
      </div>

      {/* Company Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{step1.companyName}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{step1.emailAddress}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{step1.mobileNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Address:</span>
            <span className="font-medium">{step1.companyAddress}</span>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Member Type:</span>
            <span className="font-medium capitalize">
              {step1.applicationMemberType}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">
              {step1.membershipStatus}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Representative Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Representative Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">
              {step2.firstName} {step2.lastName}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">
              {step2.representativeEmailAddress}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">
              {step2.representativeMobileNumber}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Position:</span>
            <span className="font-medium">{step2.companyDesignation}</span>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Gender:</span>
            <span className="font-medium capitalize">{step2.sex}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Nationality:</span>
            <span className="font-medium">{step2.nationality}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium capitalize">
              {step2.companyMemberType}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
