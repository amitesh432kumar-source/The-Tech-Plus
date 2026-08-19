"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="glow-brand relative overflow-hidden border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <Sparkles className="size-3.5 text-[var(--brand-purple)]" />
          Practical technology education for the future
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          Learn Technology.
          <br />
          <span className="text-gradient-brand">Build Skills.</span> Create Your
          Future.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          Learn modern technology through practical courses, live webinars,
          workshops, and real-world projects with The Tech Plus.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" className="h-11 px-6 text-base" render={<Link href="/courses" />}>
            Explore Courses
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-base"
            render={<Link href="/webinars" />}
          >
            <PlayCircle className="size-4" />
            Upcoming Webinars
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
