import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="glow-brand relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Start Learning With <span className="text-gradient-brand">The Tech Plus</span>
        </h2>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Explore practical courses and live webinars designed to help you build real technology skills.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-11 px-6 text-base" render={<Link href="/courses" />}>
            Explore Courses
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-base"
            render={<Link href="/webinars" />}
          >
            Join a Webinar
          </Button>
        </div>
      </div>
    </section>
  );
}
