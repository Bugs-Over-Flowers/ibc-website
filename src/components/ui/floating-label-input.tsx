import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface FloatingLabelInputProps
  extends React.ComponentProps<"input"> {
  label: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, startIcon, endIcon, id, ...props }, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="relative">
      {startIcon && (
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {startIcon}
        </div>
      )}
      <Input
        ref={ref}
        id={inputId}
        className={cn(
          "peer bg-transparent placeholder-transparent focus:placeholder-muted-foreground dark:bg-transparent",
          startIcon ? "pl-10" : "",
          endIcon ? "pr-10" : "",
          className
        )}
        placeholder={props.placeholder || " "}
        {...props}
      />
      {endIcon && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {endIcon}
        </div>
      )}
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-2 top-0 -translate-y-1/2 scale-75 bg-background px-2 text-muted-foreground transition-all duration-200 ease-in-out pointer-events-none",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:bg-transparent",
          "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:bg-background peer-focus:text-primary",
          // Error state
          "peer-aria-[invalid=true]:text-destructive",
          "peer-aria-[invalid=true]:peer-focus:text-destructive",
           // Adjust left position if startIcon is present
           startIcon && "peer-placeholder-shown:left-9"
        )}
      >
        {label}
      </label>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
