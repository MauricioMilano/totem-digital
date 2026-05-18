"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopNavItem {
  label: string;
  href: string;
}

interface TopNavProps {
  brand?: string;
  items?: TopNavItem[];
  signInHref?: string;
  signUpHref?: string;
  className?: string;
}

export function TopNav({
  brand = "Cal.com",
  items = [
    { label: "Product", href: "/product" },
    { label: "Solutions", href: "/solutions" },
    { label: "Resources", href: "/resources" },
    { label: "Pricing", href: "/pricing" },
    { label: "Enterprise", href: "/enterprise" },
  ],
  signInHref = "/signin",
  signUpHref = "/signup",
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        "h-16 bg-canvas border-b border-hairline flex items-center px-6",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-ink font-cal text-title-lg"
        >
          <span className="text-primary font-cal text-title-lg">{brand}</span>
        </Link>

        {/* Nav Items */}
        <nav className="hidden md:flex items-center gap-6">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-nav-link text-body text-body-md font-cal-body font-medium leading-relaxed hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={signInHref}
            className="text-ink text-body-md font-cal-body font-medium hover:text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href={signUpHref}
            className="bg-primary text-on-primary text-button font-cal-body font-semibold rounded-pill px-6 py-3 h-11 inline-flex items-center justify-center hover:bg-primary-active transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </header>
  );
}
