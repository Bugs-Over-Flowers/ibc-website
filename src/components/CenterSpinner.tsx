import type { ComponentProps } from "react";
import { Spinner } from "./ui/spinner";

export default function CenterSpinner({
  ...props
}: ComponentProps<typeof Spinner>) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner {...props} />
    </div>
  );
}
