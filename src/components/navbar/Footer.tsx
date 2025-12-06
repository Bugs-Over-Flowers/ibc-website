import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Events", href: "/events" },
  { title: "Members", href: "/members" },
  { title: "Network", href: "/network" },
  { title: "Contact", href: "/contact" },
] as const;

const Footer = () => {
  return (
    <footer className="border-t bg-muted">
      <div className="max-w-(--breakpoint-xl) mx-auto">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 px-6 xl:px-0">
          {/* Logo and Tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 no-underline">
              <Image
                src="/logo/ibc-logo-2.png"
                alt="Iloilo Business Club"
                width={50}
                height={50}
                className="object-contain"
              />
              <span className="text-xl font-bold text-foreground">
                Iloilo Business Club
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              Sustaining the Momentum for Progress since 1990.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="font-medium text-foreground">Quick Links</h6>
            <ul className="mt-6 space-y-4">
              {quickLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground no-underline hover-underline-animation"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h6 className="font-medium text-foreground">Contact Info</h6>
            <ul className="mt-6 space-y-4 text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St.,
                  Iloilo City 5000
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 shrink-0" />
                <span>(033) 337 - 8341</span>
              </li>
              <li className="flex items-center gap-2">
                <MailIcon className="h-5 w-5 shrink-0" />
                <a
                  href="mailto:iloilobusinessclub1990@gmail.com"
                  className="text-muted-foreground hover:text-foreground no-underline"
                >
                  iloilobusinessclub1990@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        <div className="py-8 flex items-center justify-center px-6 xl:px-0">
          {/* Copyright */}
          <span className="text-muted-foreground text-sm">
            © 2025 Iloilo Business Club. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
