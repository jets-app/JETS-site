"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  X as XIcon,
  Star,
  Pencil,
} from "lucide-react";
import {
  updateSettings,
  toggleApplicationsOpen,
} from "@/server/actions/settings.actions";

interface SchoolInfoCardProps {
  settings: {
    currentAcademicYear: string;
    openSchoolYears: string[];
    applicationFeeAmount: number;
    applicationsOpen: boolean;
    schoolName: string;
    schoolLegalName: string;
    schoolEin: string;
    schoolAddress: string;
    schoolPhone: string;
    schoolEmail: string;
    calendlyUrl: string | null;
  };
}

export function SchoolInfoCard({ settings }: SchoolInfoCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    schoolName: settings.schoolName,
    schoolLegalName: settings.schoolLegalName,
    schoolEin: settings.schoolEin,
    schoolAddress: settings.schoolAddress,
    schoolPhone: settings.schoolPhone,
    schoolEmail: settings.schoolEmail,
    currentAcademicYear: settings.currentAcademicYear,
    applicationFeeAmountDollars: (settings.applicationFeeAmount / 100).toFixed(
      2
    ),
    calendlyUrl: settings.calendlyUrl ?? "",
  });
  const [openYears, setOpenYears] = useState<string[]>(
    settings.openSchoolYears.length > 0
      ? settings.openSchoolYears
      : [settings.currentAcademicYear]
  );
  const [newYearStart, setNewYearStart] = useState("");

  function addYear() {
    const raw = newYearStart.trim();
    let start: number;
    let yearStr: string;

    // Accept "2027-2028" or just "2027"
    const rangeMatch = raw.match(/^(\d{4})\s*-\s*(\d{4})$/);
    if (rangeMatch) {
      start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (end !== start + 1) {
        alert(
          `School years must be consecutive. "${start}-${end}" should be "${start}-${start + 1}".`
        );
        return;
      }
      yearStr = `${start}-${end}`;
    } else if (/^\d{4}$/.test(raw)) {
      start = parseInt(raw, 10);
      yearStr = `${start}-${start + 1}`;
    } else {
      alert("Please enter a year range like 2027-2028 (or just 2027).");
      return;
    }

    if (start < 2020 || start > 2050) {
      alert("Year must be between 2020 and 2050.");
      return;
    }

    if (openYears.includes(yearStr)) {
      alert("That year is already in the list");
      return;
    }
    setOpenYears([...openYears, yearStr].sort());
    setNewYearStart("");
  }

  function removeYear(year: string) {
    if (openYears.length === 1) {
      alert("You must keep at least one school year open");
      return;
    }
    const filtered = openYears.filter((y) => y !== year);
    setOpenYears(filtered);
    // If removed year was the current year, switch to the first available
    if (form.currentAcademicYear === year) {
      setForm({ ...form, currentAcademicYear: filtered[0] });
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateSettings({
          schoolName: form.schoolName,
          schoolLegalName: form.schoolLegalName,
          schoolEin: form.schoolEin,
          schoolAddress: form.schoolAddress,
          schoolPhone: form.schoolPhone,
          schoolEmail: form.schoolEmail,
          currentAcademicYear: form.currentAcademicYear,
          openSchoolYears: openYears,
          applicationFeeAmount: Math.round(
            parseFloat(form.applicationFeeAmountDollars || "0") * 100
          ),
          calendlyUrl: form.calendlyUrl,
        });
        setSavedAt(new Date());
        setEditing(false);
        router.refresh();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to update settings";
        alert(msg);
      }
    });
  };

  const handleCancel = () => {
    // Revert local state to the saved settings
    setForm({
      schoolName: settings.schoolName,
      schoolLegalName: settings.schoolLegalName,
      schoolEin: settings.schoolEin,
      schoolAddress: settings.schoolAddress,
      schoolPhone: settings.schoolPhone,
      schoolEmail: settings.schoolEmail,
      currentAcademicYear: settings.currentAcademicYear,
      applicationFeeAmountDollars: (
        settings.applicationFeeAmount / 100
      ).toFixed(2),
      calendlyUrl: settings.calendlyUrl ?? "",
    });
    setOpenYears(
      settings.openSchoolYears.length > 0
        ? settings.openSchoolYears
        : [settings.currentAcademicYear],
    );
    setEditing(false);
  };

  const handleToggleOpen = () => {
    startTransition(async () => {
      try {
        await toggleApplicationsOpen();
        router.refresh();
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to toggle applications status";
        alert(msg);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle>School Info</CardTitle>
              <CardDescription className="pt-1">
                Core organization details, academic year, and application
                settings.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.applicationsOpen ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="size-3" /> Applications Open
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <XCircle className="size-3" /> Applications Closed
              </Badge>
            )}
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!editing ? (
        <CardContent className="space-y-6">
          {/* ============ View mode ============ */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Academic Year</h3>
            <div className="rounded-lg border bg-muted/20 px-3 py-2 space-y-1.5">
              {openYears.map((year) => {
                const isCurrent = settings.currentAcademicYear === year;
                return (
                  <div
                    key={year}
                    className="flex items-center gap-2 text-sm"
                  >
                    {isCurrent && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    )}
                    <span className={isCurrent ? "font-medium" : ""}>
                      {year}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px]">
                        Current
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <ReadField
              label="Application Fee"
              value={`$${(settings.applicationFeeAmount / 100).toFixed(2)}`}
            />
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Applications Open</p>
                <p className="text-xs text-muted-foreground">
                  Controls whether parents can start new applications.
                </p>
              </div>
              <Switch
                checked={settings.applicationsOpen}
                onCheckedChange={handleToggleOpen}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">School Details</h3>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              <ReadField label="Display Name" value={settings.schoolName} />
              <ReadField label="Legal Name" value={settings.schoolLegalName} />
              <ReadField label="EIN" value={settings.schoolEin} />
              <ReadField label="Email" value={settings.schoolEmail} />
              <ReadField label="Phone" value={settings.schoolPhone} />
              <ReadField
                label="Calendly URL"
                value={settings.calendlyUrl || "—"}
              />
              <div className="sm:col-span-2">
                <ReadField label="Address" value={settings.schoolAddress} />
              </div>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          {/* ============ Edit mode ============ */}
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Academic Year Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Academic Year</h3>

            {/* School Years list */}
            <div className="space-y-2">
              <Label>School Years</Label>
              <p className="text-xs text-muted-foreground">
                Manage all school years. Star the current year — it becomes the
                default across the CRM. Years listed here are open for parent
                applications.
              </p>
              <div className="rounded-lg border divide-y">
                {openYears.map((year) => {
                  const isCurrent = form.currentAcademicYear === year;
                  return (
                    <div
                      key={year}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setForm({ ...form, currentAcademicYear: year })
                          }
                          className={`p-1 rounded ${
                            isCurrent
                              ? "text-amber-500"
                              : "text-muted-foreground hover:text-amber-500"
                          }`}
                          title={isCurrent ? "Current year" : "Set as current year"}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={isCurrent ? "currentColor" : "none"}
                          />
                        </button>
                        <span className="text-sm font-medium">{year}</span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeYear(year)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive"
                        title="Remove year"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="text"
                  placeholder="e.g. 2027-2028"
                  value={newYearStart}
                  onChange={(e) => setNewYearStart(e.target.value)}
                  className="max-w-[200px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addYear();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addYear}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Year
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Format: 2027-2028 (school year runs September through June).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="applicationFeeAmountDollars">
                Application Fee (USD)
              </Label>
              <Input
                id="applicationFeeAmountDollars"
                type="number"
                min="0"
                step="0.01"
                value={form.applicationFeeAmountDollars}
                onChange={(e) =>
                  setForm({
                    ...form,
                    applicationFeeAmountDollars: e.target.value,
                  })
                }
                className="max-w-[200px]"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Applications Open</p>
                <p className="text-xs text-muted-foreground">
                  Controls whether parents can start new applications.
                </p>
              </div>
              <Switch
                checked={settings.applicationsOpen}
                onCheckedChange={handleToggleOpen}
                disabled={isPending}
              />
            </div>
          </div>

          {/* School Details Section */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">School Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="schoolName">Display Name</Label>
                <Input
                  id="schoolName"
                  value={form.schoolName}
                  onChange={(e) =>
                    setForm({ ...form, schoolName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolLegalName">Legal Name</Label>
                <Input
                  id="schoolLegalName"
                  value={form.schoolLegalName}
                  onChange={(e) =>
                    setForm({ ...form, schoolLegalName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolEin">EIN</Label>
                <Input
                  id="schoolEin"
                  value={form.schoolEin}
                  onChange={(e) =>
                    setForm({ ...form, schoolEin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolEmail">Email</Label>
                <Input
                  id="schoolEmail"
                  type="email"
                  value={form.schoolEmail}
                  onChange={(e) =>
                    setForm({ ...form, schoolEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolPhone">Phone</Label>
                <Input
                  id="schoolPhone"
                  value={form.schoolPhone}
                  onChange={(e) =>
                    setForm({ ...form, schoolPhone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="calendlyUrl">Calendly URL</Label>
                <Input
                  id="calendlyUrl"
                  placeholder="https://calendly.com/..."
                  value={form.calendlyUrl}
                  onChange={(e) =>
                    setForm({ ...form, calendlyUrl: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="schoolAddress">Address</Label>
                <Input
                  id="schoolAddress"
                  value={form.schoolAddress}
                  onChange={(e) =>
                    setForm({ ...form, schoolAddress: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            {savedAt && (
              <span className="text-xs text-muted-foreground">
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </form>
      </CardContent>
      )}
    </Card>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-sm font-medium break-words">{value || "—"}</p>
    </div>
  );
}
