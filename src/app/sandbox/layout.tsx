import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "JETS — Sandbox Design Preview",
};

export default function SandboxLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sandbox-root min-h-screen bg-[#0f0d0a] text-white antialiased">
      {children}
    </div>
  );
}
