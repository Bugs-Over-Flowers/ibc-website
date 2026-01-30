"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button aria-hidden className="bg-none" size="icon" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      aria-label="Toggle theme"
      className="relative rounded-xl bg-transparent backdrop-blur transition-colors hover:bg-transparent"
      onClick={toggleTheme}
      size="icon"
    >
      <Sun className="h-[1.5rem] w-[1.5rem] text-status-yellow transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:text-accent-foreground" />
    </Button>
  );
}
