import { auth } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/server/db";
import { getAvailableInterviewSlots } from "@/server/actions/interview.actions";
import { InterviewScheduler } from "./_components/interview-scheduler";
import { CheckCircle2, Video } from "lucide-react";

export const metadata = {
  title: "Schedule Your Interview — JETS Portal",
};

export default async function InterviewSchedulerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/portal/interview/${id}`);

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
    : "the student";

  // Already booked? Show confirmation screen instead of picker.
  if (application.interviewDate && application.interviewStatus === "SCHEDULED") {
    const when = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Los_Angeles",
      timeZoneName: "short",
    }).format(application.interviewDate);

    return (
      <div className="max-w-xl mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Interview scheduled</h1>
        <p className="text-muted-foreground mb-8">
          {studentName}&apos;s admissions interview is confirmed.
        </p>

        <div className="bg-card border rounded-2xl p-6 text-left space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              When
            </p>
            <p className="font-semibold mt-1">{when}</p>
          </div>
          {application.interviewZoomJoinUrl && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Zoom meeting
              </p>
              <a
                href={application.interviewZoomJoinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-1 text-primary font-medium hover:underline"
              >
                <Video className="h-4 w-4" />
                Join Zoom
              </a>
              {application.interviewZoomPasscode && (
                <p className="text-sm text-muted-foreground mt-1">
                  Passcode: {application.interviewZoomPasscode}
                </p>
              )}
            </div>
          )}
          {!application.interviewZoomJoinUrl && (
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">
                Your Zoom link will be sent to you by email before the interview.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Need to reschedule? Email{" "}
          <a href="mailto:info@jetsschool.org" className="underline">
            info@jetsschool.org
          </a>
          .
        </p>
      </div>
    );
  }

  if (application.status !== "INTERVIEW_SCHEDULED") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6">
        <h1 className="text-2xl font-bold mb-2">Not ready yet</h1>
        <p className="text-muted-foreground">
          Your application isn&apos;t ready for scheduling. We&apos;ll email you
          when it is.
        </p>
      </div>
    );
  }

  const slots = await getAvailableInterviewSlots();

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Schedule {studentName}&apos;s interview
        </h1>
        <p className="text-muted-foreground">
          Pick a 30-minute time that works for you. You&apos;ll receive a Zoom
          link by email as soon as you confirm.
        </p>
      </div>
      <InterviewScheduler applicationId={application.id} slotsIso={slots} />
    </div>
  );
}
