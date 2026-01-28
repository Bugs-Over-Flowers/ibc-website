"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/NightModeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "HOME", path: "/" },
  { name: "ABOUT", path: "/about" },
  { name: "EVENTS", path: "/events" },
  { name: "MEMBERS", path: "/members" },
  { name: "NETWORKS", path: "/networks" },
  { name: "CONTACT", path: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    // reference `pathname` explicitly so the exhaustive-deps rule keeps it
    if (pathname !== undefined) {
      setMobileMenuOpen(false);
    }
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <motion.header
      animate={{ y: 0 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-white shadow-sm transition-all duration-300 dark:bg-slate-950 dark:shadow-md",
      )}
      initial={{ y: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-7">
        <div className="flex h-16 items-center justify-between gap-3 md:h-20">
          {/* Logo */}
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12">
              <Image
                alt="IBC Logo"
                className="object-contain"
                height={200}
                priority
                src="/logo/ibc-logo-2.png"
                width={200}
              />
            </div>
            <span
              className={cn(
                "truncate font-bold text-foreground transition-colors md:text-xl",
              )}
            >
              ILOILO BUSINESS CLUB, INC.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 lg:flex xl:gap-6">
            {navLinks.map((link) => (
              <Link
                className={cn(
                  "rounded-md px-2 py-2 font-semibold text-sm transition-colors hover:text-primary",
                  pathname === link.path ? "text-primary" : "text-foreground",
                )}
                href={link.path as Route}
                key={link.name}
              >
                {link.name}
              </Link>
            ))}

            <Link className="ml-2" href="/membership/application">
              <Button className="min-w-[110px] rounded-full px-5 py-1 font-semibold text-md shadow-lg">
                JOIN NOW
              </Button>
            </Link>

            <ModeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-b-xl border-border border-t bg-background/95 py-4 shadow-md backdrop-blur-xl lg:hidden"
            id="mobile-navigation"
            initial={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col gap-1 px-2">
              {navLinks.map((link) => (
                <Link
                  className={cn(
                    "rounded-lg px-4 py-3 font-medium transition-colors",
                    pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                  href={link.path as Route}
                  key={link.name}
                >
                  {link.name}
                </Link>
              ))}

              <div className="px-2 pt-2">
                <Link className="block w-full" href="/membership/application">
                  <Button className="w-full rounded-full py-3">Join Now</Button>
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
