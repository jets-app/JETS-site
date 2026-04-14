import { auth } from "@/server/auth";
import { PortalSidebarWrapper } from "./_components/portal-sidebar-wrapper";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="min-h-screen bg-background">
      <PortalSidebarWrapper userId={userId} />
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
