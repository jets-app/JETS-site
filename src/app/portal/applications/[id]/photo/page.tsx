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
import { PhotoUploader } from "./photo-uploader";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoUploadPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const application = await db.application.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!application) notFound();

  if (application.parentId !== session.user.id) {
    // Treat as not found to avoid leaking existence of other apps
    notFound();
  }

  if (!application.student) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <LinkButton href="/portal/dashboard" variant="ghost" size="sm" className="-ml-2">
            <ChevronLeft className="size-4" />
            Back to Dashboard
          </LinkButton>
        </div>
        <div className="rounded-xl border bg-card p-12 text-center space-y-3">
          <h2 className="text-xl font-semibold">Complete Student Information First</h2>
          <p className="text-sm text-muted-foreground">
            Please fill out the student information (Step 1) before uploading a photo.
          </p>
          <LinkButton href={`/portal/applications/${id}/edit`} className="mt-4">
            Go to Application Form
          </LinkButton>
        </div>
      </div>
    );
  }

  const studentName =
    `${application.student.firstName} ${application.student.lastName}`.trim();
  const isSubmitted = application.status !== "DRAFT";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Back link */}
      <div>
        <LinkButton
          href="/portal"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ChevronLeft className="size-4" />
          Back to Dashboard
        </LinkButton>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Application for {application.academicYear}
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
          Student Photo
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a recent photograph of{" "}
          <span className="font-medium text-foreground">{studentName}</span>.
          This photo will appear on the application file and, if accepted, the
          student ID.
        </p>
      </div>

      {/* Uploader card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {application.student.photoUrl ? "Update Photo" : "Upload Photo"}
          </CardTitle>
          <CardDescription>
            {application.student.photoUrl
              ? "A photo has already been uploaded. You can replace it below."
              : "Choose an image from your device and preview it before saving."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="rounded-md border border-amber-300/40 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/40">
              This application has been submitted. The photo can no longer be
              changed from the portal. Please contact the admissions office if
              an update is needed.
            </div>
          ) : (
            <PhotoUploader
              applicationId={application.id}
              currentPhotoUrl={application.student.photoUrl}
              studentName={studentName}
              disabled={isSubmitted}
            />
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Recent photograph (within the last 12 months).</li>
            <li>Clear, well-lit, front-facing head and shoulders.</li>
            <li>Neutral background; no filters or heavy editing.</li>
            <li>JPG, PNG, or WEBP format &middot; under 5MB.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
