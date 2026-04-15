"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  stagger?: number;
}

/**
 * Splits text into words that fade + slide in on scroll.
 * Respects reduced motion.
 */
export function AnimatedHeading({
  text,
  className,
  as = "h2",
  delay = 0,
  stagger = 0.06,
}: AnimatedHeadingProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom pb-[0.15em]"
          style={{ marginRight: "0.22em" }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeUp({ children, className, delay = 0 }: FadeUpProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
