import { ReactNode } from "react";

interface EditorialSectionProps {
  children: ReactNode;
  kicker?: string;
  className?: string;
  bordered?: boolean;
  id?: string;
}

export function EditorialSection({
  children,
  kicker,
  className = "",
  bordered = true,
  id,
}: EditorialSectionProps) {
  return (
    <section
      id={id}
      className={`relative ${className}`}
      style={
        bordered
          ? { borderTop: "1px solid var(--v2-rule)" }
          : undefined
      }
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        {kicker && (
          <div className="v2-kicker mb-8 flex items-center gap-3">
            <span
              className="inline-block w-8 h-px"
              style={{ background: "var(--v2-burgundy)" }}
            />
            {kicker}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function OrnamentDivider() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="v2-ornament py-10" style={{ color: "var(--v2-gold)" }}>
        <span>✦</span>
      </div>
    </div>
  );
}
