import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function DashboardRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  // All staff (admin, principal, secretary, reviewer) get the full admin
  // experience — the old /review/dashboard was a legacy stripped-down view.
  if (
    role === "ADMIN" ||
    role === "PRINCIPAL" ||
    role === "SECRETARY" ||
    role === "REVIEWER"
  ) {
    redirect("/admin/dashboard");
  }
  redirect("/portal/dashboard");
}
