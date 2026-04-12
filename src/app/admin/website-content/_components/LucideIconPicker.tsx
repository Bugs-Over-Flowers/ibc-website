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
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Cog,
  Compass,
  Cpu,
  FileText,
  Flag,
  Gem,
  Gift,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Home,
  Landmark,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Phone,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LucideIconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

interface IconOption {
  name: string;
  Icon: LucideIcon;
}

const ICON_OPTIONS: IconOption[] = [
  { name: "Activity", Icon: Activity },
  { name: "Anchor", Icon: Anchor },
  { name: "Bell", Icon: Bell },
  { name: "BookOpen", Icon: BookOpen },
  { name: "CalendarDays", Icon: CalendarDays },
  { name: "Camera", Icon: Camera },
  { name: "Cloud", Icon: Cloud },
  { name: "Compass", Icon: Compass },
  { name: "FileText", Icon: FileText },
  { name: "Gift", Icon: Gift },
  { name: "Home", Icon: Home },
  { name: "Mail", Icon: Mail },
  { name: "MapPin", Icon: MapPin },
  { name: "Phone", Icon: Phone },
  { name: "Zap", Icon: Zap },
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
}: LucideIconPickerProps) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">Choose Icon</p>
      <div className="grid auto-cols-max grid-flow-col grid-rows-3 gap-2 overflow-x-auto overflow-y-hidden rounded-lg border border-border p-3">
        {ICON_OPTIONS.map(({ name, Icon }) => {
          const isSelected = selectedIcon === name;

          return (
            <button
              aria-label={name}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md border p-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted",
              )}
              key={name}
              onClick={() => onSelect(name)}
              title={name}
              type="button"
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
