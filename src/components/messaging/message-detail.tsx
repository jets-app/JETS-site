"use client";

import { format } from "date-fns";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MessageDetailProps {
  message: {
    id: string;
    subject: string;
    body: string;
    isRead: boolean;
    isBulk: boolean;
    bulkGroup?: string | null;
    createdAt: string | Date;
    sender?: { id: string; name: string; email: string; role: string } | null;
    receiver?: { id: string; name: string; email: string; role: string } | null;
  };
  onBack: () => void;
}

export function MessageDetail({ message, onBack }: MessageDetailProps) {
  const date = new Date(message.createdAt);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Back to messages</span>
      </div>

      {/* Message */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 sm:p-6 border-b space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {message.subject}
            </h2>
            {message.isBulk && (
              <Badge variant="secondary">Bulk</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {message.sender?.name || "System"}
              </p>
              <p className="text-xs text-muted-foreground">
                To: {message.receiver?.name || "You"} &middot;{" "}
                {format(date, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
            {message.body}
          </div>
        </div>
      </div>
    </div>
  );
}
