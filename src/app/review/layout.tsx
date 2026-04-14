import { PortalSidebar } from "@/components/layout/portal-sidebar";

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Principals/reviewers use a simpler layout for now
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
