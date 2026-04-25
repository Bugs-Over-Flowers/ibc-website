import type { LucideProps } from "lucide-react";
import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import RegistrationStepHeader from "../RegistrationStepHeader";

interface RegistrationStepCardProps {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export default function RegistrationStepCard({
  Icon,
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: RegistrationStepCardProps) {
  return (
    <Card className={className}>
      <RegistrationStepHeader
        className={headerClassName}
        description={description}
        Icon={Icon}
        title={title}
      />
      <CardContent className={contentClassName}>{children}</CardContent>
      <CardFooter className={footerClassName}>{footer}</CardFooter>
    </Card>
  );
}
