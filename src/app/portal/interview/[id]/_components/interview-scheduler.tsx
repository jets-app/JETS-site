"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookInterview } from "@/server/actions/interview.actions";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const TIMEZONE = "America/Los_Angeles";

interface Props {
  applicationId: string;
  slotsIso: string[];
}

export function InterviewScheduler({ applicationId, slotsIso }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  // Group slots by date key (YYYY-MM-DD in LA time)
  const grouped = useMemo(() => {
    const byDate: Record<string, string[]> = {};
    for (const iso of slotsIso) {
      const key = formatDateKey(new Date(iso));
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(iso);
    }
    for (const key in byDate) byDate[key].sort();
    return byDate;
  }, [slotsIso]);

  const availableDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Preselect first available date
  const [dateIndex, setDateIndex] = useState(0);
  const activeDate = selectedDate ?? availableDates[dateIndex] ?? null;

  if (availableDates.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <h2 className="font-semibold mb-1">No times available</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          We couldn&apos;t find any open interview slots in the next two weeks.
          Please email us at info@jetsschool.org and we&apos;ll coordinate
          directly.
        </p>
      </div>
    );
  }

  const slotsForActive = activeDate ? grouped[activeDate] ?? [] : [];

  function handleConfirm() {
    if (!selectedSlot) return;
    setError(null);
    startSubmitting(async () => {
      const result = await bookInterview(applicationId, selectedSlot);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function shiftDate(delta: number) {
    setSelectedDate(null);
    setSelectedSlot(null);
    setDateIndex((i) => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next >= availableDates.length) return availableDates.length - 1;
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Date strip */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            Pick a date
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              disabled={dateIndex === 0}
              className="h-8 w-8 rounded-md border flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftDate(1)}
              disabled={dateIndex >= availableDates.length - 1}
              className="h-8 w-8 rounded-md border flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {availableDates.slice(dateIndex, dateIndex + 5).map((dateKey) => {
            const d = parseDateKey(dateKey);
            const isActive = activeDate === dateKey;
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => {
                  setSelectedDate(dateKey);
                  setSelectedSlot(null);
                }}
                className={`rounded-xl border p-3 text-center transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {d.toLocaleDateString("en-US", {
                    weekday: "short",
                    timeZone: TIMEZONE,
                  })}
                </p>
                <p className="text-lg font-bold mt-1">
                  {d.toLocaleDateString("en-US", {
                    day: "numeric",
                    timeZone: TIMEZONE,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.toLocaleDateString("en-US", {
                    month: "short",
                    timeZone: TIMEZONE,
                  })}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Times grid */}
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          Pick a time (Los Angeles)
        </p>
        {slotsForActive.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No times available on this date.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slotsForActive.map((iso) => {
              const isSelected = selectedSlot === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedSlot(iso)}
                  className={`h-11 rounded-lg border font-medium text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {formatTime(new Date(iso))}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Confirm */}
      <Button
        size="lg"
        className="w-full"
        disabled={!selectedSlot || isSubmitting}
        onClick={handleConfirm}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : selectedSlot ? (
          <>
            Confirm {formatSlotForButton(new Date(selectedSlot))}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          "Pick a time to continue"
        )}
      </Button>
    </div>
  );
}

function formatDateKey(d: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const parts = new Intl.DateTimeFormat("en-CA", opts).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

function parseDateKey(key: string): Date {
  // Treat as midnight LA time — return a Date that represents the start of
  // that day in LA (close enough for display purposes)
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)); // noon UTC → still that date in LA
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(d);
}

function formatSlotForButton(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(d);
}
