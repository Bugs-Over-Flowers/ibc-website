"use client";

import { LogIn, Menu } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Members", href: "#members" },
    { name: "Network", href: "#network" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20"
          : "bg-white/10 backdrop-blur-md"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="flex items-center gap-3">
            <Image
              src="/logo/ibc-logo-2.png"
              alt="IBC Logo"
              width={40}
              height={48}
              className="h-10 md:h-12 w-auto"
            />
            <span
              className={`text-lg md:text-xl font-semibold transition-colors ${
                isScrolled ? "text-[#2E2A6E]" : "text-white"
              }`}
            >
              Iloilo Business Club
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-6 text-decora">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground/80" : "text-white/90"
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-3 ml-2">
              <Button
                variant="ghost"
                onClick={() => onNavigate("admin-login")}
                className={`text-sm font-medium ${
                  isScrolled
                    ? "text-foreground/80 hover:text-primary hover:bg-primary/10"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                onClick={() => onNavigate("membership-application")}
                className="bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm border border-white/20 shadow-lg"
              >
                Join Now
              </Button>
            </div>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`${
                  isScrolled ? "text-foreground" : "text-white"
                } bg-white/10 backdrop-blur-sm border border-white/20`}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-white/80 backdrop-blur-xl border-l border-white/20"
            >
              <div className="flex items-center gap-3 mb-8">
                <Image
                  src="/images/ibc-logo-2.png"
                  alt="IBC Logo"
                  width={32}
                  height={40}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-semibold text-[#2E2A6E]">
                  IBC
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onNavigate("admin-login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      onNavigate("membership-application");
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                  >
                    Join Now
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
