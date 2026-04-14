import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function DashboardRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (role === "PRINCIPAL" || role === "REVIEWER") {
    redirect("/review/dashboard");
  } else {
    redirect("/portal/dashboard");
  }
}
