import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("glow-brand border-b border-border", className)}>
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-blue)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-balance text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
