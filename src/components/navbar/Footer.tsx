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
    <footer id="contact" className="bg-sidebar-foreground/90 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/ibc-logo-2.png"
                alt="IBC Logo"
                width={48}
                height={56}
                className="h-14 w-auto brightness-0 invert"
              />
              <h3 className="text-2xl font-bold">Iloilo Business Club</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sustaining the Momentum for Progress since 1990.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border text-muted border-white/20 flex items-center justify-center hover:bg-white hover:text-foreground transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-white/70">
                  GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St.,
                  Iloilo City 5000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-white/70">(033) 337 - 8341</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-white/70">
                  iloilobusinessclub1990@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        <Separator className="bg-white/20 mb-8" />

        <div className="text-center text-white/60">
          <p>&copy; 2025 Iloilo Business Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
