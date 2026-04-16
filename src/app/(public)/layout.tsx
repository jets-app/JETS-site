import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="v2-root v2-paper min-h-screen flex flex-col">
      {children}
    </div>
  );
}
