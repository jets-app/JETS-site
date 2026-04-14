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
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import {
  updateSettings,
  toggleApplicationsOpen,
} from "@/server/actions/settings.actions";

interface SchoolInfoCardProps {
  settings: {
    currentAcademicYear: string;
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
          applicationFeeAmount: Math.round(
            parseFloat(form.applicationFeeAmountDollars || "0") * 100
          ),
          calendlyUrl: form.calendlyUrl,
        });
        setSavedAt(new Date());
        router.refresh();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to update settings";
        alert(msg);
      }
    });
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
          {settings.applicationsOpen ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" /> Applications Open
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <XCircle className="size-3" /> Applications Closed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Academic Year Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Academic Year</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentAcademicYear">Current Academic Year</Label>
                <Input
                  id="currentAcademicYear"
                  value={form.currentAcademicYear}
                  onChange={(e) =>
                    setForm({ ...form, currentAcademicYear: e.target.value })
                  }
                  placeholder="2026-2027"
                />
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
                />
              </div>
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

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
            {savedAt && (
              <span className="text-xs text-muted-foreground">
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
