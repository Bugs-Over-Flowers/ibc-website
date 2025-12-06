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

export default function Navbar() {
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
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NextLink
                  href="/"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
                >
                  Home
                </NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NextLink
                  href="/about"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
                >
                  About
                </NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NextLink
                  href="/events"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
                >
                  Events
                </NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NextLink
                  href="/members"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
                >
                  Members
                </NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NextLink
                  href="/network"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
                >
                  Network
                </NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NextLink
                  href="/contact"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
                >
                  Contact
                </NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <Button variant="default" className="ml-4">
              <span className="sr-only">Log In</span>
              Log In
            </Button>
          </NavigationMenuList>
        </div>
      </div>
    </NavigationMenu>
  );
}
