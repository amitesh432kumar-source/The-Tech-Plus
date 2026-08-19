"use client";

import { motion } from "framer-motion";
import { Code2, Globe2, Layers, Radio, Sparkles, Target } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Practical Learning",
    description: "Every course is built around applying skills, not just watching videos.",
  },
  {
    icon: Layers,
    title: "Real-World Projects",
    description: "Practice with projects that mirror what you'll actually build on the job.",
  },
  {
    icon: Radio,
    title: "Live Learning",
    description: "Join live webinars and workshops to learn directly from instructors.",
  },
  {
    icon: Sparkles,
    title: "Updated Technology",
    description: "Course content is kept current with today's tools and practices.",
  },
  {
    icon: Code2,
    title: "Structured Courses",
    description: "Clear modules and lessons designed for steady, guided progress.",
  },
  {
    icon: Globe2,
    title: "Learn From Anywhere",
    description: "Access every course and webinar on any device, on your schedule.",
  },
];

export function TrustBenefits() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="card-hover rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
                <benefit.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
