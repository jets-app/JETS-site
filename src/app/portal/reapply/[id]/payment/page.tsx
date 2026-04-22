import { auth } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/server/db";
import { ReapplicationPayment } from "./_components/reapplication-payment";

export const metadata = {
  title: "Complete Registration — JETS",
};

export default async function ReapplicationPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const app = await db.application.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!app) notFound();
  if (app.parentId !== session.user.id) notFound();

  if (app.applicationFeePaid) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-3">Reapplication complete</h1>
        <p className="text-muted-foreground mb-8">
          Thanks for reapplying. We&apos;ll be in touch about next steps.
        </p>
        <a
          href="/portal/dashboard"
          className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Go to dashboard
        </a>
      </div>
    );
  }

  const studentName = app.student
    ? `${app.student.firstName} ${app.student.lastName}`
    : "Student";

  return (
    <div className="max-w-2xl mx-auto">
      <ReapplicationPayment
        applicationId={app.id}
        academicYear={app.academicYear}
        studentName={studentName}
        feeAmountCents={app.applicationFeeAmount}
        existingDiscountCode={app.discountCode}
        existingDiscountAmount={app.discountAmount}
      />
    </div>
  );
}
