"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { createManualApplication } from "@/server/actions/admin-application.actions";
import type { ApplicationStatus } from "@prisma/client";

const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "OFFICE_REVIEW", label: "Office Review" },
  { value: "PRINCIPAL_REVIEW", label: "Principal Review" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DOCUMENTS_PENDING", label: "Documents Pending" },
  { value: "SCHOLARSHIP_REVIEW", label: "Scholarship Review" },
  { value: "ENROLLED", label: "Enrolled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WAITLISTED", label: "Waitlisted" },
];

const MAX_DOB = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().split("T")[0];
})();

export default function NewApplicationPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    studentFirstName: "",
    studentLastName: "",
    studentDob: "",
    studentEmail: "",
    studentPhone: "",
    studentAddress: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    academicYear: "2026-2027",
    status: "DRAFT" as ApplicationStatus,
    applicationFeePaid: false,
    notes: "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.studentFirstName || !form.studentLastName || !form.studentDob) {
      setError("Student first name, last name, and date of birth are required.");
      return;
    }
    if (!form.parentName || !form.parentEmail) {
      setError("Parent name and email are required.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createManualApplication(form);
        router.push(`/admin/applications/${result.applicationId}`);
      } catch (err: any) {
        setError(err.message ?? "Failed to create application");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/applications"
          className="admin-btn-ghost !p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="admin-page-title">Add Application</h1>
          <p className="admin-page-subtitle">
            Manually create a new student application.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="admin-card p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Student Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="admin-input"
                value={form.studentFirstName}
                onChange={(e) => updateField("studentFirstName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="admin-input"
                value={form.studentLastName}
                onChange={(e) => updateField("studentLastName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                max={MAX_DOB}
                className="admin-input"
                value={form.studentDob}
                onChange={(e) => updateField("studentDob", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="admin-input"
                value={form.studentEmail}
                onChange={(e) => updateField("studentEmail", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                className="admin-input"
                value={form.studentPhone}
                onChange={(e) => updateField("studentPhone", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                className="admin-input"
                value={form.studentAddress}
                onChange={(e) => updateField("studentAddress", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div className="admin-card p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Parent Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="admin-input"
                value={form.parentName}
                onChange={(e) => updateField("parentName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="admin-input"
                value={form.parentEmail}
                onChange={(e) => updateField("parentEmail", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                className="admin-input"
                value={form.parentPhone}
                onChange={(e) => updateField("parentPhone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="admin-card p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Application Settings
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                className="admin-input"
                value={form.academicYear}
                onChange={(e) => updateField("academicYear", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Application Status
              </label>
              <select
                className="admin-input"
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
                }
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                id="feePaid"
                checked={form.applicationFeePaid}
                onChange={(e) =>
                  updateField("applicationFeePaid", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="feePaid" className="text-sm font-medium text-gray-700">
                Application fee paid
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Optional notes about this application..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/applications" className="admin-btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn-primary"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
