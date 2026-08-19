"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const points = [
  "Courses built around applying skills to real, practical projects",
  "Live webinars and workshops taught directly by instructors",
  "Structured modules so you always know what to learn next",
  "Progress tracking and certificates that recognize what you've built",
];

export function WhyTechPlus() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why <span className="text-gradient-brand">The Tech Plus</span>
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            We focus on practical, hands-on technology education — designed so
            what you learn translates directly into things you can build and
            skills you can use.
          </p>

          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--brand-blue)]" />
                <span className="text-sm text-foreground/90">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="glow-brand relative aspect-square w-full max-w-md justify-self-center overflow-hidden rounded-3xl border border-border bg-card p-8"
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Course Progress</span>
              <span className="rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white">
                On Track
              </span>
            </div>
            <div className="space-y-3">
              {["Module 1: Foundations", "Module 2: Core Concepts", "Module 3: Real Project"].map(
                (label, i) => (
                  <div key={label} className="rounded-xl border border-border bg-background/60 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">{[100, 60, 20][i]}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: `${[100, 60, 20][i]}%` }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
