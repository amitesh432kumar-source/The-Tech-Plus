"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(targetMs));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(targetMs)), 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  if (remaining.done) {
    return <p className="text-sm font-medium text-[var(--brand-blue)]">Starting soon</p>;
  }

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map((unit) => (
        <div key={unit.label} className="rounded-lg border border-border bg-background/60 py-2 text-center">
          <div className="text-lg font-bold tabular-nums">{String(unit.value).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
