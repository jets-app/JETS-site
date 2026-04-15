import { ReactNode } from "react";

interface DropCapParagraphProps {
  children: ReactNode;
  className?: string;
}

export function DropCapParagraph({ children, className = "" }: DropCapParagraphProps) {
  return (
    <p
      className={`v2-drop-cap v2-editorial ${className}`}
      style={{
        fontSize: "18.5px",
        lineHeight: 1.65,
        color: "var(--v2-ink)",
      }}
    >
      {children}
    </p>
  );
}
