"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import ExportPDFButton from "../../_components/ExportPDFButton";

interface ApplicationHeaderProps {
  application: Awaited<ReturnType<typeof getApplicationDetailsById>>;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = application.logoImageURL && !imageError;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="flex w-full justify-between">
          <div className="flex flex-col justify-end">
            <h1 className="font-bold text-3xl">{application.companyName}</h1>
            <p className="mt-1 text-muted-foreground">
              Application #{application.applicationId.slice(0, 8)}
            </p>
          </div>
          <div className="shrink-0">
            {showImage ? (
              <Image
                alt={`${application.companyName} logo`}
                height={100}
                onError={() => setImageError(true)}
                src={application.logoImageURL as string}
                unoptimized
                width={100}
              />
            ) : (
              <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 font-semibold text-4xl text-gray-600">
                {application.companyName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {application.businessMemberId && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Badge className="text-sm" variant="default">
              Approved
            </Badge>
            <span className="text-muted-foreground text-sm">
              Member ID: {application.businessMemberId}
            </span>
          </div>
          <div>
            <ExportPDFButton application={application} />
          </div>
        </div>
      )}
    </>
  );
}
