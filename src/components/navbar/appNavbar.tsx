import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-25">
          <div className="shrink-0">
            <Link
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
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium no-underline"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="no-underline text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/events"
                className="no-underline text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Events
              </Link>
              <Link
                href="/members"
                className="no-underline text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Members
              </Link>
              <Link
                href="/network"
                className="no-underline text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Network
              </Link>
              <Link
                href="/contact"
                className="no-underline text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </Link>

              <Button variant="default" className="ml-4">
                <span className="sr-only">Log In</span>
                Log In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
