import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/shared/link-button";
import { ChevronLeft, CheckCircle2, CreditCard, Receipt } from "lucide-react";
import { PaymentClient } from "./payment-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ApplicationPaymentPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/portal/applications/${id}/payment`);
  }

  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
  });

  if (!application) notFound();
  if (application.parentId !== session.user.id) notFound();

  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "Student";

  const baseAmount = application.applicationFeeAmount;
  const discountAmount = application.discountAmount;
  const finalAmount = Math.max(0, baseAmount - discountAmount);

  // If already paid, show receipt
  if (application.applicationFeePaid) {
    const payment = await db.payment.findFirst({
      where: {
        applicationId: application.id,
        type: "APPLICATION_FEE",
        status: "SUCCEEDED",
      },
      orderBy: { paidAt: "desc" },
    });

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <LinkButton
            href="/portal/dashboard"
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </LinkButton>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Application Fee
          </h1>
          <p className="text-muted-foreground">
            {studentName} · {application.academicYear}
          </p>
        </div>

        <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Payment Received</CardTitle>
                <CardDescription>
                  Thank you — your application fee has been paid.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Receipt className="h-4 w-4" />
                Receipt
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">School Year</span>
                <span className="text-right font-medium">
                  {application.academicYear}
                </span>
                <span className="text-muted-foreground">Student</span>
                <span className="text-right font-medium">{studentName}</span>
                {payment && (
                  <>
                    <span className="text-muted-foreground">Paid on</span>
                    <span className="text-right font-medium">
                      {formatDate(payment.paidAt)}
                    </span>
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-right font-medium">
                      {formatCents(payment.amount)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <LinkButton
          href="/portal/dashboard"
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </LinkButton>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Pay Application Fee
        </h1>
        <p className="text-muted-foreground">
          {studentName} · {application.academicYear}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Application Fee</CardTitle>
              <CardDescription>
                A one-time non-refundable fee to complete your submission.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fee breakdown */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application fee</span>
              <span className="font-medium">{formatCents(baseAmount)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>
                  Discount{" "}
                  {application.discountCode && (
                    <span className="opacity-70">
                      ({application.discountCode})
                    </span>
                  )}
                </span>
                <span className="font-medium">
                  −{formatCents(discountAmount)}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total due</span>
              <span className="font-bold text-lg">
                {formatCents(finalAmount)}
              </span>
            </div>
          </div>

          <PaymentClient
            applicationId={application.id}
            finalAmount={finalAmount}
            hasDiscount={discountAmount > 0}
            existingCode={application.discountCode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
