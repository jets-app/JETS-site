import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getApplicationById } from "@/server/actions/application.actions";
import { ApplicationFormWizard } from "@/components/application/application-form-wizard";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const application = await getApplicationById(id);

  if (!application) {
    redirect("/portal/applications");
  }

  // Transform the application data for the client
  const initialData = {
    id: application.id,
    referenceNumber: application.referenceNumber,
    status: application.status,
    academicYear: application.academicYear,
    currentStep: application.currentStep,
    completionPct: application.completionPct,
    applicationFeePaid: application.applicationFeePaid,
    applicationFeeAmount: application.applicationFeeAmount,
    discountCode: application.discountCode,
    discountAmount: application.discountAmount,
    essay: application.essay,
    student: application.student
      ? {
          firstName: application.student.firstName,
          lastName: application.student.lastName,
          middleName: application.student.middleName,
          preferredName: application.student.preferredName,
          dateOfBirth: application.student.dateOfBirth.toISOString().split("T")[0],
          phone: application.student.phone,
          email: application.student.email,
          addressLine1: application.student.addressLine1,
          addressLine2: application.student.addressLine2,
          city: application.student.city,
          state: application.student.state,
          zipCode: application.student.zipCode,
          country: application.student.country,
          photoUrl: application.student.photoUrl,
        }
      : null,
    hebrewNames: application.hebrewNames as Record<string, string> | null,
    fatherInfo: application.fatherInfo as Record<string, string> | null,
    motherInfo: application.motherInfo as Record<string, string> | null,
    guardianInfo: application.guardianInfo as Record<string, string> | null,
    emergencyContact: application.emergencyContact as Record<string, string> | null,
    siblings: application.siblings as unknown[] | null,
    grandparents: application.grandparents as Record<string, unknown> | null,
    schoolHistory: application.schoolHistory as Record<string, unknown> | null,
    parentQuestions: application.parentQuestions as Record<string, unknown> | null,
    applicantAssessment: application.applicantAssessment as Record<string, unknown> | null,
    studiesInfo: application.studiesInfo as Record<string, unknown> | null,
    tradePreferences: application.tradePreferences as Record<string, unknown> | null,
    extracurricular: application.extracurricular as Record<string, unknown> | null,
    additionalQuestions: application.additionalQuestions as Record<string, unknown> | null,
    recommendations: application.recommendations.map((r) => ({
      id: r.id,
      name: r.refereeName,
      email: r.refereeEmail,
      phone: r.refereePhone,
      relationship: r.refereeRelation,
      status: r.status,
    })),
    payments: application.payments.map((p) => ({
      id: p.id,
      type: p.type,
      status: p.status,
      amount: p.amount,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ApplicationFormWizard application={initialData} />
    </div>
  );
}
