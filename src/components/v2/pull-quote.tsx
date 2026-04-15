interface PullQuoteProps {
  children: React.ReactNode;
  attribution?: string;
  role?: string;
  align?: "left" | "right" | "center";
  size?: "md" | "lg";
}

export function PullQuote({
  children,
  attribution,
  role,
  align = "left",
  size = "md",
}: PullQuoteProps) {
  const sizeClass =
    size === "lg"
      ? "text-3xl md:text-4xl lg:text-5xl"
      : "text-2xl md:text-3xl";

  return (
    <figure
      className={`py-8 ${align === "center" ? "text-center" : ""}`}
      style={{
        borderTop: "1px solid var(--v2-rule)",
        borderBottom: "1px solid var(--v2-rule)",
      }}
    >
      <blockquote
        className={`v2-pullquote ${sizeClass}`}
      >
        <span
          aria-hidden
          style={{ color: "var(--v2-gold)", marginRight: "0.1em" }}
        >
          &ldquo;
        </span>
        {children}
        <span aria-hidden style={{ color: "var(--v2-gold)" }}>
          &rdquo;
        </span>
      </blockquote>
      {(attribution || role) && (
        <figcaption className="mt-5 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
          {attribution}
          {role && (
            <span style={{ color: "var(--v2-ink-faint)" }}>
              {attribution ? " · " : ""}
              {role}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
