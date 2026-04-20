"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Loader2, Send, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  sendMessageToAdmin,
  getConversationWithAdmin,
  markAllAsRead,
} from "@/server/actions/message.actions";

interface ConversationMessage {
  id: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string | Date;
  senderId: string;
  receiverId: string | null;
  sender?: { id: string; name: string; email: string; role: string } | null;
  receiver?: { id: string; name: string; email: string; role: string } | null;
}

interface PortalMessagesClientProps {
  initialInbox: unknown;
  unreadCount: number;
  userId: string;
  initialConversation: ConversationMessage[];
}

export function PortalMessagesClient({
  userId,
  initialConversation,
}: PortalMessagesClientProps) {
  const [conversation, setConversation] = useState(initialConversation);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, startSendTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.length]);

  // Mark unread messages as read on mount
  useEffect(() => {
    markAllAsRead(userId).catch(() => {});
  }, [userId]);

  const refreshConversation = async () => {
    const data = await getConversationWithAdmin(userId);
    setConversation(JSON.parse(JSON.stringify(data)));
  };

  const handleSend = () => {
    setError(null);
    if (!body.trim()) return;
    const message = body;
    setBody("");
    startSendTransition(async () => {
      try {
        await sendMessageToAdmin(message);
        await refreshConversation();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send");
        setBody(message); // restore on error
      }
    });
  };

  function formatDateDivider(date: Date): string {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  }

  // Group messages by date
  const grouped: { date: string; messages: ConversationMessage[] }[] = [];
  for (const msg of conversation) {
    const dateStr = formatDateDivider(new Date(msg.createdAt));
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateStr) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: dateStr, messages: [msg] });
    }
  }

  return (
    <div className="rounded-xl border bg-card flex flex-col" style={{ height: "70vh", minHeight: "500px" }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <UserIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Start a conversation</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Have a question for the JETS admin office? Type a message below and we&apos;ll respond as soon as we can.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center justify-center">
                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              {group.messages.map((m) => {
                const mine = m.senderId === userId;
                const date = new Date(m.createdAt);
                return (
                  <div
                    key={m.id}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[75%] flex flex-col", mine ? "items-end" : "items-start")}>
                      {!mine && (
                        <span className="text-[11px] text-muted-foreground mb-0.5 ml-3">
                          {m.sender?.name || "JETS Admin"}
                        </span>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words",
                          mine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        {m.body}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-2">
                        {format(date, "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-t p-3 sm:p-4">
        {error && (
          <p className="text-xs text-destructive mb-2 px-1">{error}</p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none rounded-2xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 max-h-32"
            style={{ minHeight: "42px" }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !body.trim()}
            className="h-[42px] w-[42px] shrink-0 rounded-full"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground mt-2 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
