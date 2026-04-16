import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <AdminSidebar />
      <main className="lg:ml-[264px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-5 sm:p-7 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
