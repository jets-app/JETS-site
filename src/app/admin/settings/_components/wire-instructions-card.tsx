"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Landmark, CheckCircle2, Pencil } from "lucide-react";
import { updateSettings } from "@/server/actions/settings.actions";

interface WireSettings {
  wireBankName: string | null;
  wireAccountName: string | null;
  wireRoutingNumber: string | null;
  wireAccountNumber: string | null;
  wireSwiftCode: string | null;
  wireBankAddress: string | null;
  wireInstructions: string | null;
}

export function WireInstructionsCard({ settings }: { settings: WireSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    wireBankName: settings.wireBankName ?? "",
    wireAccountName: settings.wireAccountName ?? "",
    wireRoutingNumber: settings.wireRoutingNumber ?? "",
    wireAccountNumber: settings.wireAccountNumber ?? "",
    wireSwiftCode: settings.wireSwiftCode ?? "",
    wireBankAddress: settings.wireBankAddress ?? "",
    wireInstructions: settings.wireInstructions ?? "",
  });

  const isReady = Boolean(
    settings.wireBankName &&
      settings.wireRoutingNumber &&
      settings.wireAccountNumber,
  );

  function save() {
    startTransition(async () => {
      await updateSettings(form);
      setSavedAt(new Date());
      setEditing(false);
      router.refresh();
    });
  }

  function cancel() {
    setForm({
      wireBankName: settings.wireBankName ?? "",
      wireAccountName: settings.wireAccountName ?? "",
      wireRoutingNumber: settings.wireRoutingNumber ?? "",
      wireAccountNumber: settings.wireAccountNumber ?? "",
      wireSwiftCode: settings.wireSwiftCode ?? "",
      wireBankAddress: settings.wireBankAddress ?? "",
      wireInstructions: settings.wireInstructions ?? "",
    });
    setEditing(false);
  }

  // Mask bank account numbers in view mode — only show the last 4 digits.
  function maskAcct(value: string | null): string {
    if (!value) return "—";
    if (value.length <= 4) return value;
    return `•••• ${value.slice(-4)}`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Landmark className="size-5" />
            </div>
            <div>
              <CardTitle>Wire Transfer Instructions</CardTitle>
              <CardDescription>
                Bank info shown to parents and donors who pay by wire.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isReady ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Visible to parents
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Hidden until completed
              </span>
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
        <CardContent className="space-y-4">
          {!isReady ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-5 text-center text-sm text-muted-foreground">
              No wire instructions set yet. Click Edit to add bank info — until
              then, parents won&apos;t see a wire payment option.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              <ReadField label="Bank name" value={settings.wireBankName} />
              <ReadField label="Account name" value={settings.wireAccountName} />
              <ReadField
                label="Routing (ABA)"
                value={maskAcct(settings.wireRoutingNumber)}
              />
              <ReadField
                label="Account number"
                value={maskAcct(settings.wireAccountNumber)}
              />
              {settings.wireSwiftCode && (
                <ReadField label="SWIFT code" value={settings.wireSwiftCode} />
              )}
              {settings.wireBankAddress && (
                <ReadField
                  label="Bank address"
                  value={settings.wireBankAddress}
                />
              )}
              {settings.wireInstructions && (
                <div className="sm:col-span-2">
                  <ReadField
                    label="Additional instructions"
                    value={settings.wireInstructions}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Bank name"
              value={form.wireBankName}
              onChange={(v) => setForm((f) => ({ ...f, wireBankName: v }))}
              placeholder="e.g. Chase Bank"
              required
            />
            <Field
              label="Account name"
              value={form.wireAccountName}
              onChange={(v) => setForm((f) => ({ ...f, wireAccountName: v }))}
              placeholder="e.g. JETS Synagogue"
              hint="Defaults to school name if blank"
            />
            <Field
              label="Routing number (ABA)"
              value={form.wireRoutingNumber}
              onChange={(v) => setForm((f) => ({ ...f, wireRoutingNumber: v }))}
              placeholder="9 digits"
              required
            />
            <Field
              label="Account number"
              value={form.wireAccountNumber}
              onChange={(v) => setForm((f) => ({ ...f, wireAccountNumber: v }))}
              placeholder="Account number"
              required
            />
            <Field
              label="SWIFT code (international)"
              value={form.wireSwiftCode}
              onChange={(v) => setForm((f) => ({ ...f, wireSwiftCode: v }))}
              placeholder="Optional — for international wires"
            />
            <Field
              label="Bank address"
              value={form.wireBankAddress}
              onChange={(v) => setForm((f) => ({ ...f, wireBankAddress: v }))}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label className="text-sm">Additional instructions</Label>
            <Textarea
              value={form.wireInstructions}
              onChange={(e) =>
                setForm((f) => ({ ...f, wireInstructions: e.target.value }))
              }
              placeholder="Optional — e.g. 'Please reference the invoice number in the wire memo.'"
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button onClick={save} disabled={isPending} size="sm">
              {isPending ? "Saving…" : "Save Wire Info"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            {savedAt && (
              <span className="text-xs text-muted-foreground">
                Saved at {savedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ReadField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-sm font-medium break-words">{value || "—"}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-sm">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5"
      />
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
