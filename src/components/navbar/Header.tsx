"use client";

import {
  Root as NavigationMenu,
  Item as NavigationMenuItem,
  Link as NavigationMenuLink,
  List as NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { title: "HOME", href: "/" },
  { title: "ABOUT", href: "/about" },
  { title: "EVENTS", href: "/events" },
  { title: "MEMEBERS", href: "/members" },
  { title: "NETWORK", href: "/network" },
  { title: "CONTACT", href: "/contact" },
];

export default function Header() {
  return (
    <NavigationMenu className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <NextLink
          href="/"
          className="flex items-center space-x-1 gap-2 no-underline"
        >
          <Image
            src="/logo/ibc-logo-2.png"
            alt="Iloilo Business Club"
            width={50}
            height={50}
            className="object-contain"
          />
          <span className="text-4xl font-bold text-gray-800">
            Iloilo Business Club
          </span>
        </NextLink>

        <div className="hidden md:block">
          <NavigationMenuList className="ml-10 flex items-baseline space-x-4">
            {navLinks.map(({ title, href }) => (
              <NavigationMenuItem key={title}>
                <NavigationMenuLink asChild>
                  <NextLink
                    href={href as any}
                    className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-md font-medium no-underline hover-underline-animation center"
                  >
                    {title}
                  </NextLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            <Button variant="default" className="ml-4 font-medium text-md">
              <span className="sr-only">SIGN IN</span>
              SIGN IN
            </Button>
          </NavigationMenuList>
        </div>
      </div>
    </NavigationMenu>
  );
}
