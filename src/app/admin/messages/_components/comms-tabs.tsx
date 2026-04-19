"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Messages", href: "/admin/messages" },
  { label: "Notifications", href: "/admin/notifications" },
];

export function CommsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 border-b border-[var(--jet-border)] mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              isActive
                ? "border-[#A30018] text-[#A30018]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
