"use client";

import { useState, useTransition } from "react";
import { updateInquiryStatus, updateInquiry } from "@/server/actions/inquiry.actions";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  source: string;
  status: string;
  studentAge: number | null;
  interestedIn: string | null;
  preferredDate: string | null;
  referredBy: string | null;
  referralSource: string | null;
  notes: string | null;
  assignedTo: string | null;
  followUpAt: string | null;
  createdAt: string;
}

const REFERRAL_SOURCE_LABELS: Record<string, string> = {
  friend_family: "Friend or family",
  alumni: "Alumni / student",
  rabbi_teacher: "Rabbi or teacher",
  google: "Google search",
  social_media: "Social media",
  event: "Community event",
  website: "JETS website",
  other: "Other",
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "New", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  { value: "CONTACTED", label: "Contacted", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  { value: "TOUR_SCHEDULED", label: "Tour Scheduled", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" },
  { value: "TOUR_COMPLETED", label: "Tour Completed", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400" },
  { value: "CONVERTED", label: "Converted", color: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
];

const PROGRAM_LABELS: Record<string, string> = {
  judaic_studies: "Judaic Studies",
  applied_technology: "Applied Technology",
  skilled_trades: "Skilled Trades",
  business: "Business & Enterprise",
  academic: "Academic / GED",
  undecided: "Undecided",
};

export function LeadsTable({
  inquiries,
  total,
}: {
  inquiries: Inquiry[];
  total: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
    });
  }

  function handleAddNote(id: string, note: string) {
    startTransition(async () => {
      await updateInquiry(id, { notes: note });
    });
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {total} {total === 1 ? "lead" : "leads"}
        </span>
      </div>

      <div className="divide-y">
        {inquiries.map((inq) => {
          const expanded = expandedId === inq.id;
          const statusOpt = STATUS_OPTIONS.find((s) => s.value === inq.status);

          return (
            <div key={inq.id} className={isPending ? "opacity-60" : ""}>
              <div
                className="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expanded ? null : inq.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{inq.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {inq.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {inq.interestedIn && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {PROGRAM_LABELS[inq.interestedIn] ?? inq.interestedIn}
                      </span>
                    )}
                    {inq.studentAge && (
                      <span className="text-xs text-muted-foreground">
                        Age {inq.studentAge}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {inq.source === "inquiry_form" ? "Inquiry" : "Contact"}
                    </span>
                    {inq.referredBy && (
                      <span className="text-xs text-primary font-medium">
                        Ref: {inq.referredBy}
                      </span>
                    )}
                    {!inq.referredBy && inq.referralSource && (
                      <span className="text-xs text-muted-foreground">
                        via {REFERRAL_SOURCE_LABELS[inq.referralSource] ?? inq.referralSource}
                      </span>
                    )}
                  </div>
                </div>

                <select
                  value={inq.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(inq.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusOpt?.color ?? ""}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>

                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expanded && (
                <div className="px-4 pb-4 bg-muted/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium mb-1">Contact</p>
                      <p>{inq.email}</p>
                      {inq.phone && <p>{inq.phone}</p>}
                    </div>
                    {inq.preferredDate && (
                      <div>
                        <p className="text-muted-foreground text-xs font-medium mb-1">Preferred Visit</p>
                        <p>{new Date(inq.preferredDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {inq.referralSource && (
                      <div>
                        <p className="text-muted-foreground text-xs font-medium mb-1">How They Heard About Us</p>
                        <p>{REFERRAL_SOURCE_LABELS[inq.referralSource] ?? inq.referralSource}</p>
                      </div>
                    )}
                    {inq.referredBy && (
                      <div>
                        <p className="text-muted-foreground text-xs font-medium mb-1">Referred By</p>
                        <p>{inq.referredBy}</p>
                      </div>
                    )}
                    {inq.message && (
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground text-xs font-medium mb-1">Message</p>
                        <p className="whitespace-pre-wrap">{inq.message}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground text-xs font-medium mb-1">Internal Notes</p>
                      <NoteEditor
                        initialNotes={inq.notes ?? ""}
                        onSave={(note) => handleAddNote(inq.id, note)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {inquiries.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No inquiries yet. Leads will appear here when visitors submit the
            inquiry or contact form.
          </div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({
  initialNotes,
  onSave,
}: {
  initialNotes: string;
  onSave: (note: string) => void;
}) {
  const [value, setValue] = useState(initialNotes);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex gap-2">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={2}
        className="flex-1 text-sm rounded-md border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Add notes about this lead..."
      />
      <button
        type="button"
        onClick={() => {
          onSave(value);
          setSaved(true);
        }}
        className="self-end px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
