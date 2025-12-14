"use client";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Events", path: "/events" },
  { name: "Members", path: "/members" },
  { name: "Networks", path: "/networks" },
  { name: "Contact", path: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      animate={{ y: 0 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-border border-b bg-background/95 shadow-soft backdrop-blur-xl"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Logo */}
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12">
              <Image
                alt="IBC Logo"
                className="h-10 w-10 object-contain md:h-12 md:w-12"
                height={48}
                priority
                src="/logo/ibc-logo-2.png"
                unoptimized={false}
                width={48}
              />
            </div>
            <span
              className={`truncate font-semibold text-lg transition-colors md:text-xl ${
                isScrolled ? "text-foreground" : "text-secondary-foreground"
              }`}
            >
              Iloilo Business Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 lg:flex xl:gap-6">
            {navLinks.map((link) => (
              <a
                className={`rounded-md px-3 py-2 font-medium text-sm transition-colors hover:text-primary ${
                  pathname === link.path
                    ? "text-primary"
                    : isScrolled
                      ? "text-foreground/80"
                      : "text-secondary-foreground/90"
                }`}
                href={link.path}
                key={link.name}
              >
                {link.name}
              </a>
            ))}
            <Button
              asChild
              className="ml-2 h-auto min-w-[110px] rounded-full bg-primary px-5 py-2 text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <Link href="/contact">Join Now</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            asChild
            className={`rounded-lg p-2 transition-colors lg:hidden ${
              isScrolled
                ? "text-foreground hover:bg-muted"
                : "text-secondary-foreground hover:bg-secondary-foreground/10"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-b-xl border-border border-t bg-background/95 py-4 shadow-md backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col gap-1 px-2">
              {navLinks.map((link) => (
                <a
                  className={`rounded-lg px-4 py-3 font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                  href={link.path}
                  key={link.name}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="px-2 pt-2">
                <Button asChild className="w-full rounded-full px-0 py-3">
                  <a href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Join Now
                  </a>
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
