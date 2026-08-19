"use client";

import { motion } from "framer-motion";
import {
  Award,
  Compass,
  Hammer,
  ListChecks,
  Rocket,
  UserPlus,
} from "lucide-react";

const steps = [
  { icon: Compass, title: "Explore", description: "Browse courses, webinars, and workshops." },
  { icon: UserPlus, title: "Register", description: "Create your free account in seconds." },
  { icon: ListChecks, title: "Enroll", description: "Enroll in the course or event you choose." },
  { icon: Hammer, title: "Learn", description: "Work through structured modules and lessons." },
  { icon: Rocket, title: "Build", description: "Apply what you learn to real projects." },
  { icon: Award, title: "Get Certified", description: "Complete the course and earn your certificate." },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
          <p className="mt-2 text-muted-foreground">
            A simple path from discovering a course to earning your certificate.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="absolute right-5 top-5 text-3xl font-black text-muted-foreground/20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
                <step.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
