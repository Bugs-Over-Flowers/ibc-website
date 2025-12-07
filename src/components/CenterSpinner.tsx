import type { ComponentProps } from "react";
import { Spinner } from "./ui/spinner";

export default function CenterSpinner({
  ...props
}: ComponentProps<typeof Spinner>) {
  return (
    <div className="flex justify-center h-screen w-full items-center">
      <Spinner {...props} />
    </div>
  );
}
