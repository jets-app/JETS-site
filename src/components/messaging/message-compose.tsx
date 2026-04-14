"use client";

import { useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sendMessage,
  sendBulkMessage,
  searchParents,
} from "@/server/actions/message.actions";
import { Send, X, Search, Users, Loader2 } from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface MessageComposeProps {
  templates: Template[];
  academicYears: string[];
  onSent: () => void;
  onCancel: () => void;
}

interface ParentResult {
  id: string;
  name: string;
  email: string;
}

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
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export function MessageCompose({
  templates,
  academicYears,
  onSent,
  onCancel,
}: MessageComposeProps) {
  const [mode, setMode] = useState<"individual" | "bulk">("individual");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<ParentResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ParentResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (q.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await searchParents(q);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    },
    []
  );

  const handleSelectTemplate = (templateId: string | null) => {
    if (!templateId) return;
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSend = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "individual") {
          if (!selectedRecipient) {
            setError("Please select a recipient");
            return;
          }
          await sendMessage(selectedRecipient.id, subject, body);
        } else {
          const filters: {
            applicationStatus?: ApplicationStatus;
            academicYear?: string;
          } = {};
          if (filterStatus) {
            filters.applicationStatus = filterStatus as ApplicationStatus;
          }
          if (filterYear) {
            filters.academicYear = filterYear;
          }
          await sendBulkMessage(
            subject,
            body,
            Object.keys(filters).length > 0 ? filters : undefined
          );
        }
        onSent();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send message"
        );
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Compose Message</h3>
          <Button variant="ghost" size="icon-sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "individual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("individual")}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Individual
          </Button>
          <Button
            variant={mode === "bulk" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("bulk")}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Bulk Message
          </Button>
        </div>

        {/* Recipient */}
        {mode === "individual" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            {selectedRecipient ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedRecipient.name} ({selectedRecipient.email})
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setSelectedRecipient(null);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search parents by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="pl-8"
                />
                {showSearch && searchResults.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full rounded-lg border bg-popover shadow-md max-h-48 overflow-y-auto">
                    {searchResults.map((parent) => (
                      <button
                        key={parent.id}
                        className="flex flex-col w-full text-left px-3 py-2 hover:bg-muted text-sm"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedRecipient(parent);
                          setShowSearch(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        <span className="font-medium">{parent.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {parent.email}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-medium">Recipients Filter</label>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Application Status
                </label>
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Academic Year
                </label>
                <Select value={filterYear} onValueChange={(v) => setFilterYear(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {academicYears.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {!filterStatus && !filterYear
                ? "Message will be sent to all parents."
                : "Message will be sent to parents matching the selected filters."}
            </p>
          </div>
        )}

        {/* Template Selector */}
        {templates.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              Use Template (optional)
            </label>
            <Select onValueChange={handleSelectTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subject</label>
          <Input
            placeholder="Message subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            placeholder="Type your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-32"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending || !subject.trim() || !body.trim()}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Send className="h-4 w-4 mr-1.5" />
            )}
            {mode === "bulk" ? "Send to All" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
