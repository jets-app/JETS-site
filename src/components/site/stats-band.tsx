"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";

const stats = [
  { value: 812, suffix: "+", label: "Graduates" },
  { value: 57, suffix: "", label: "Courses" },
  { value: 16, suffix: "+", label: "Years" },
  { value: 9.5, suffix: "", label: "Acre Campus" },
];

function AnimatedNumber({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Number((increment * step).toFixed(1)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const display = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[var(--jet-primary)] py-16 lg:py-20">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                <AnimatedNumber
                  target={stat.value}
                  suffix={stat.suffix}
                  inView={inView}
                />
              </div>
              <div className="mt-2 text-sm sm:text-base font-medium text-white/70 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
