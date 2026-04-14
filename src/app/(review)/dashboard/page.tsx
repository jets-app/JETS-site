import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

export default async function ReviewDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Review Dashboard
        </h1>
        <p className="text-muted-foreground">
          Applications assigned to you for review.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="font-medium text-muted-foreground mb-1">
          No applications to review
        </h3>
        <p className="text-sm text-muted-foreground/70">
          When the office forwards applications, they&apos;ll appear here.
        </p>
      </div>
    </div>
  );
}
