"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Anchor,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  CheckSquare2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Cloud,
  Cog,
  Compass,
  Cpu,
  CreditCard,
  DollarSign,
  FileCheck2,
  FileText,
  Flag,
  Gem,
  Gift,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Home,
  IdCard,
  Landmark,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Phone,
  QrCode,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Tag,
  Target,
  TrendingUp,
  Trophy,
  UploadCloud,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LucideIconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  disabled?: boolean;
}

interface IconOption {
  name: string;
  Icon: LucideIcon;
}

const ICON_OPTIONS: IconOption[] = [
  { name: "Activity", Icon: Activity },
  { name: "Anchor", Icon: Anchor },
  { name: "Bell", Icon: Bell },
  { name: "Building", Icon: Building },
  { name: "BookOpen", Icon: BookOpen },
  { name: "CalendarDays", Icon: CalendarDays },
  { name: "Calendar", Icon: Calendar },
  { name: "Camera", Icon: Camera },
  { name: "CircleDollarSign", Icon: CircleDollarSign },
  { name: "Clock3", Icon: Clock3 },
  { name: "CheckSquare2", Icon: CheckSquare2 },
  { name: "Cloud", Icon: Cloud },
  { name: "Compass", Icon: Compass },
  { name: "CreditCard", Icon: CreditCard },
  { name: "DollarSign", Icon: DollarSign },
  { name: "FileCheck2", Icon: FileCheck2 },
  { name: "FileText", Icon: FileText },
  { name: "Gift", Icon: Gift },
  { name: "Home", Icon: Home },
  { name: "IdCard", Icon: IdCard },
  { name: "Mail", Icon: Mail },
  { name: "MapPin", Icon: MapPin },
  { name: "Phone", Icon: Phone },
  { name: "QrCode", Icon: QrCode },
  { name: "Search", Icon: Search },
  { name: "Tag", Icon: Tag },
  { name: "UploadCloud", Icon: UploadCloud },
  { name: "UserCircle", Icon: UserCircle },
  { name: "UserPlus", Icon: UserPlus },
  { name: "Zap", Icon: Zap },
  { name: "Wallet", Icon: Wallet },
  { name: "Handshake", Icon: Handshake },
  { name: "TrendingUp", Icon: TrendingUp },
  { name: "Users", Icon: Users },
  { name: "Award", Icon: Award },
  { name: "Globe", Icon: Globe },
  { name: "Lightbulb", Icon: Lightbulb },
  { name: "Shield", Icon: Shield },
  { name: "Palette", Icon: Palette },
  { name: "Building2", Icon: Building2 },
  { name: "Target", Icon: Target },
  { name: "Sparkles", Icon: Sparkles },
  { name: "Briefcase", Icon: Briefcase },
  { name: "Rocket", Icon: Rocket },
  { name: "Trophy", Icon: Trophy },
  { name: "Star", Icon: Star },
  { name: "Gem", Icon: Gem },
  { name: "Landmark", Icon: Landmark },
  { name: "Megaphone", Icon: Megaphone },
  { name: "Cpu", Icon: Cpu },
  { name: "GraduationCap", Icon: GraduationCap },
  { name: "ClipboardCheck", Icon: ClipboardCheck },
  { name: "CheckCircle2", Icon: CheckCircle2 },
  { name: "BarChart3", Icon: BarChart3 },
  { name: "Cog", Icon: Cog },
  { name: "Wrench", Icon: Wrench },
  { name: "Flag", Icon: Flag },
  { name: "Heart", Icon: Heart },
];

export function LucideIconPicker({
  selectedIcon,
  onSelect,
  disabled = false,
}: LucideIconPickerProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => ICON_OPTIONS.find((option) => option.name === selectedIcon),
    [selectedIcon],
  );

  const SelectedIcon = selectedOption?.Icon;

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">Choose Icon</p>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-label="Select icon"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 w-36 justify-between overflow-hidden px-3",
          )}
          disabled={disabled}
        >
          <span className="flex min-w-0 items-center gap-2">
            {SelectedIcon ? (
              <SelectedIcon className="h-4 w-4 shrink-0" />
            ) : null}
            <span className="truncate text-sm">
              {selectedOption?.name ?? "Choose an icon"}
            </span>
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72 p-3">
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map(({ name, Icon }) => {
                const isSelected = selectedIcon === name;

                return (
                  <button
                    aria-label={name}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md border p-1 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted",
                    )}
                    disabled={disabled}
                    key={name}
                    onClick={() => {
                      onSelect(name);
                      setOpen(false);
                    }}
                    title={name}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
