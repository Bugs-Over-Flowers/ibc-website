import Image from "next/image";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import type { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";

interface ProofImagesCardProps {
  proofImages: Awaited<
    ReturnType<typeof getApplicationDetailsById>
  >["ProofImage"];
}

export function ProofImagesCard({ proofImages }: ProofImagesCardProps) {
  if (!proofImages || proofImages.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h2 className="font-semibold leading-none tracking-tight">
          Payment Proof
        </h2>
      </div>
      <div className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {proofImages.map((proof, index) => (
            <div
              className="overflow-hidden rounded-lg border"
              key={proof.proofImageId}
            >
              <ImageZoom className="h-48 w-full">
                <Image
                  alt={`Payment proof ${index + 1} of ${proofImages.length}`}
                  className="h-48 w-full object-cover"
                  height={200}
                  src={proof.path}
                  width={300}
                />
              </ImageZoom>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
