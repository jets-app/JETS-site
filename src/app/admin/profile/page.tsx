import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { ProfileForm } from "@/app/portal/profile/_components/profile-form";
import { TOTPSection } from "@/app/portal/profile/_components/totp-section";

export const metadata = { title: "My Profile — JETS Admin" };

export default async function AdminProfilePage() {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      totpEnabled: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account details, email, password, and security.
        </p>
      </div>

      <ProfileForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        }}
      />

      <div className="rounded-xl border bg-card p-6">
        <TOTPSection initiallyEnabled={user.totpEnabled} />
      </div>
    </div>
  );
}
