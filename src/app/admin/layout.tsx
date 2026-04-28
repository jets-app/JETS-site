import { auth } from "@/server/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <AdminSidebar role={role} />
      <main className="lg:ml-[264px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-5 sm:p-7 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
