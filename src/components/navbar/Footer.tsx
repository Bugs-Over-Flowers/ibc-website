"use client";

import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Members", href: "/members" },
    { name: "Events", href: "/events" },
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
    <footer
      className="border-border/30 border-t bg-background py-16"
      id="contact"
    >
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
                className="h-14 w-auto"
                height={56}
                src="/logo/ibc-logo-2.png"
                width={48}
              />
              <h3 className="font-bold text-2xl text-foreground">
                Iloilo Business Club
              </h3>
            </div>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Sustaining the Momentum for Progress since 1990.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
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
            <h4 className="mb-4 font-semibold text-foreground text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    className="text-muted-foreground transition-colors hover:text-primary"
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
            <h4 className="mb-4 font-semibold text-foreground text-lg">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St.,
                  Iloilo City 5000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">(033) 337 - 8341</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  iloilobusinessclub1990@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        <Separator className="mb-8 bg-border/30" />

        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 Iloilo Business Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
