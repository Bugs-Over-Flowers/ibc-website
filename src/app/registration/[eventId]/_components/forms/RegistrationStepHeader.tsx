import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

interface RegistrationStepHeaderProps {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  description: string;
}

export default function RegistrationStepHeader({
  Icon,
  title,
  description,
}: RegistrationStepHeaderProps) {
  return (
    <Item>
      <ItemContent>
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <ItemTitle>{title}</ItemTitle>
        </div>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  );
}
