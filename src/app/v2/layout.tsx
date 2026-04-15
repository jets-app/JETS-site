import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "The JETS Review",
    template: "%s · The JETS Review",
  },
  description:
    "The JETS Review — an editorial perspective on Torah, trade, and the life of the mind at the Jewish Educational Trade School.",
};

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="v2-root v2-paper min-h-screen flex flex-col">
      {children}
    </div>
  );
}
