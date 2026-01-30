import { Button } from "@/components/ui/button";

export function StopPropagationButton({
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) {
  return (
    <Button
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
}
