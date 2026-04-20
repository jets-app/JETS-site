import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import { ChevronLeft } from "lucide-react";
import {
  RecommendationsManager,
  type RecSummary,
  type RecStatus,
} from "./recommendations-manager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecommendationsPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/auth/login?callbackUrl=/portal/applications/${id}/recommendations`
    );
  }

  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: { select: { firstName: true, lastName: true } },
      recommendations: { orderBy: { sentAt: "asc" } },
    },
  });

  if (!application) notFound();
  if (application.parentId !== session.user.id) notFound();

  // Parent-safe projection — never expose `responses`
  const recommendations: RecSummary[] = application.recommendations.map(
    (r) => ({
      id: r.id,
      refereeName: r.refereeName,
      refereeEmail: r.refereeEmail,
      refereePhone: r.refereePhone,
      refereeRelation: r.refereeRelation,
      status: r.status as RecStatus,
      sentAt: r.sentAt,
      viewedAt: r.viewedAt,
      submittedAt: r.submittedAt,
      expiresAt: r.expiresAt,
    })
  );

  const canEdit = application.status === "DRAFT";
  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`.trim()
    : "the applicant";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Back link */}
      <div>
        <LinkButton
          href={`/portal/applications/${id}/edit`}
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ChevronLeft className="size-4" />
          Back to Application
        </LinkButton>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Application for {application.academicYear}
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
          Recommendation Letters
        </h1>
        <p className="text-sm text-muted-foreground">
          Two recommendations are required for{" "}
          <span className="font-medium text-foreground">{studentName}</span>.
          Add each referee below — they&apos;ll receive a private link by email
          to submit their response.
        </p>
      </div>

      <RecommendationsManager
        applicationId={application.id}
        recommendations={recommendations}
        canEdit={canEdit}
      />
    </div>
  );
}
