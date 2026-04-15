import { ReactNode } from "react";

interface EditorialListItem {
  number?: string;
  title: string;
  subtitle?: string;
  body: ReactNode;
}

export function EditorialList({ items }: { items: EditorialListItem[] }) {
  return (
    <ol className="space-y-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-12 gap-6 py-10 border-t"
          style={{ borderColor: "var(--v2-rule)" }}
        >
          <div
            className="col-span-12 md:col-span-2 v2-display"
            style={{
              fontSize: "2.5rem",
              lineHeight: 1,
              color: "var(--v2-burgundy)",
              fontStyle: "italic",
            }}
          >
            {item.number ?? `${String(i + 1).padStart(2, "0")}.`}
          </div>
          <div className="col-span-12 md:col-span-4">
            <h3 className="v2-display" style={{ fontSize: "1.75rem", color: "var(--v2-ink)" }}>
              {item.title}
            </h3>
            {item.subtitle && (
              <div
                className="mt-2 italic v2-editorial"
                style={{ fontSize: "15px", color: "var(--v2-ink-muted)" }}
              >
                {item.subtitle}
              </div>
            )}
          </div>
          <div
            className="col-span-12 md:col-span-6 v2-editorial"
            style={{ fontSize: "16.5px", lineHeight: 1.7, color: "var(--v2-ink)" }}
          >
            {item.body}
          </div>
        </li>
      ))}
      <li className="border-t" style={{ borderColor: "var(--v2-rule)" }} />
    </ol>
  );
}
