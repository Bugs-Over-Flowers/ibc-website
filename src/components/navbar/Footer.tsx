"use client";

import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Members", href: "#members" },
    { name: "Events", href: "#events" },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/iloilobusinessclub",
      label: "Facebook",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/company/iloilo-business-club-inc",
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="bg-sidebar-foreground/90 py-16 text-white" id="contact">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                alt="IBC Logo"
                className="h-14 w-auto brightness-0 invert"
                height={56}
                src="/logo/ibc-logo-2.png"
                width={48}
              />
              <h3 className="font-bold text-2xl">Iloilo Business Club</h3>
            </div>
            <p className="mb-6 text-white/70 leading-relaxed">
              Sustaining the Momentum for Progress since 1990.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-muted backdrop-blur-sm transition-all hover:bg-white hover:text-foreground"
                  href={social.href}
                  key={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="mb-4 font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    className="text-white/70 transition-colors hover:text-primary"
                    href={link.href}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="mb-4 font-semibold text-lg">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-white/70">
                  GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St.,
                  Iloilo City 5000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-white/70">(033) 337 - 8341</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-white/70">
                  iloilobusinessclub1990@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        <Separator className="mb-8 bg-white/20" />

        <div className="text-center text-white/60">
          <p>&copy; 2025 Iloilo Business Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
