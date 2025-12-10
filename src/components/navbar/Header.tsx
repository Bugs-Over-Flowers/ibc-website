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
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Members", href: "/members" },
    { name: "Network", href: "/network" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      animate={{ y: 0 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-white/20 border-b bg-white/70 shadow-lg backdrop-blur-xl"
          : "bg-white/10 backdrop-blur-md"
      }`}
      initial={{ y: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <a className="flex items-center gap-3" href="#home">
            <Image
              alt="IBC Logo"
              className="h-10 w-auto md:h-12"
              height={48}
              src="/logo/ibc-logo-2.png"
              width={40}
            />
            <span
              className={`font-semibold text-lg transition-colors md:text-xl ${
                isScrolled ? "text-[#2E2A6E]" : "text-white"
              }`}
            >
              Iloilo Business Club
            </span>
          </a>

          <div className="hidden items-center gap-6 text-decora lg:flex">
            {navLinks.map((link) => (
              <a
                className={`font-medium text-sm transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground/80" : "text-white/90"
                }`}
                href={link.href}
                key={link.name}
              >
                {link.name}
              </a>
            ))}
            <div className="ml-2 flex items-center gap-3">
              <Button
                className={`font-medium text-sm ${
                  isScrolled
                    ? "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => onNavigate("admin-login")}
                variant="ghost"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button
                className="border border-white/20 bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm hover:bg-primary"
                onClick={() => onNavigate("membership-application")}
              >
                Join Now
              </Button>
            </div>
          </div>

          <Sheet onOpenChange={setIsMobileMenuOpen} open={isMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                className={`${
                  isScrolled ? "text-foreground" : "text-white"
                } border border-white/20 bg-white/10 backdrop-blur-sm`}
                size="icon"
                variant="ghost"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-[300px] border-white/20 border-l bg-white/80 backdrop-blur-xl"
              side="right"
            >
              <div className="mb-8 flex items-center gap-3">
                <Image
                  alt="IBC Logo"
                  className="h-8 w-auto"
                  height={40}
                  src="/images/ibc-logo-2.png"
                  width={32}
                />
                <span className="font-semibold text-[#2E2A6E] text-lg">
                  IBC
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    className="font-medium text-foreground text-lg transition-colors hover:text-primary"
                    href={link.href}
                    key={link.name}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex flex-col gap-3 border-border/50 border-t pt-4">
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      onNavigate("admin-login");
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      onNavigate("membership-application");
                      setIsMobileMenuOpen(false);
                    }}
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
