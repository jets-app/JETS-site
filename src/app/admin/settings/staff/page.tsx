import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { listStaff } from "@/server/actions/staff.actions";
import { StaffManager } from "./_components/staff-manager";

export const metadata = { title: "Staff Accounts — JETS Admin" };

export default async function StaffPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const staff = await listStaff();
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add principals, reviewers, or other admins. Each new account gets a
          one-time email link to set their own password — you never see or set it.
        </p>
      </div>
      <StaffManager
        initialStaff={staff.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        }))}
        currentUserId={session.user.id!}
      />
    </div>
  );
}
