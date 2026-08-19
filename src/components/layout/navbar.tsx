"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm",
                  active && "bg-muted text-foreground",
                )}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Login
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/register" />}>
            Sign Up
          </Button>
          <Button size="sm" render={<Link href="/courses" />}>
            Explore Courses
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-4/5 p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => setOpen(false)}
                    render={<Link href={link.href} />}
                  >
                    {link.label}
                  </Button>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  render={<Link href="/login" />}
                >
                  Login
                </Button>
                <Button onClick={() => setOpen(false)} render={<Link href="/register" />}>
                  Sign Up
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
