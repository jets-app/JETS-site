"use client";

import { cn } from "@/lib/utils";
import { Mail, MailOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface MessageListItem {
  id: string;
  subject: string;
  body: string;
  isRead: boolean;
  isBulk: boolean;
  createdAt: string | Date;
  sender?: { id: string; name: string; email: string; role: string } | null;
  receiver?: { id: string; name: string; email: string; role: string } | null;
}

interface MessageListProps {
  messages: MessageListItem[];
  mode: "inbox" | "sent";
  onSelect: (messageId: string) => void;
  selectedId?: string;
}

export function MessageList({
  messages,
  mode,
  onSelect,
  selectedId,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Mail className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          {mode === "inbox" ? "No messages in your inbox" : "No sent messages"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {messages.map((message) => {
        const person =
          mode === "inbox" ? message.sender : message.receiver;
        const preview =
          message.body.length > 120
            ? message.body.slice(0, 120) + "..."
            : message.body;
        const date = new Date(message.createdAt);

        return (
          <button
            key={message.id}
            onClick={() => onSelect(message.id)}
            className={cn(
              "flex items-start gap-3 w-full text-left px-4 py-3 transition-colors hover:bg-muted/50",
              selectedId === message.id && "bg-muted",
              !message.isRead && mode === "inbox" && "bg-primary/[0.03]"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {message.isRead || mode === "sent" ? (
                <MailOpen className="h-4 w-4 text-muted-foreground/50" />
              ) : (
                <Mail className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-sm truncate",
                    !message.isRead && mode === "inbox"
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground/80"
                  )}
                >
                  {person?.name || person?.email || (mode === "sent" && message.isBulk ? "Bulk Message" : "Unknown")}
                </span>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDistanceToNow(date, { addSuffix: true })}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm truncate",
                  !message.isRead && mode === "inbox"
                    ? "font-medium text-foreground"
                    : "text-foreground/70"
                )}
              >
                {message.subject}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {preview}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
