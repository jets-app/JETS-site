import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { ScholarshipForm } from "./_components/scholarship-form";
import { ScholarshipStatus } from "./_components/scholarship-status";

export default async function ScholarshipPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get the parent's most recent application
  const applications = await db.application.findMany({
    where: { parentId: session.user.id },
    select: {
      id: true,
      referenceNumber: true,
      student: { select: { firstName: true, lastName: true } },
      scholarship: {
        select: {
          id: true,
          status: true,
          requestedAmount: true,
          affordableAmount: true,
          approvedAmount: true,
          financialInfo: true,
          essayResponse: true,
          reviewNotes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Pay It Forward Scholarship
        </h1>
        <p className="text-muted-foreground">
          JETS School is committed to making quality education accessible. Complete this
          confidential financial assessment to apply for tuition assistance.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            You need to create an application before applying for a scholarship.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app.id}>
              {app.scholarship ? (
                <ScholarshipStatus
                  scholarship={app.scholarship}
                  studentName={
                    app.student
                      ? `${app.student.firstName} ${app.student.lastName}`
                      : "Student"
                  }
                  referenceNumber={app.referenceNumber}
                />
              ) : (
                <ScholarshipForm
                  applicationId={app.id}
                  studentName={
                    app.student
                      ? `${app.student.firstName} ${app.student.lastName}`
                      : "Student"
                  }
                  referenceNumber={app.referenceNumber}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
