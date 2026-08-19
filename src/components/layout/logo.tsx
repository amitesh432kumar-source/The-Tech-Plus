import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-lg font-bold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-lg bg-gradient-brand text-sm font-black text-white shadow-[0_0_20px_-4px_var(--brand-blue)]"
      >
        T+
      </span>
      <span>
        The Tech <span className="text-gradient-brand">Plus</span>
      </span>
    </Link>
  );
}
