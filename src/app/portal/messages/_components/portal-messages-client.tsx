"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  CheckCheck,
  Loader2,
  Mail,
  MessageSquarePlus,
  Send,
  User as UserIcon,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  MessageList,
  type MessageListItem,
} from "@/components/messaging/message-list";
import { MessageDetail } from "@/components/messaging/message-detail";
import {
  getInbox,
  getMessage,
  markAllAsRead,
  sendMessageToAdmin,
  getConversationWithAdmin,
} from "@/server/actions/message.actions";

interface PaginatedMessages {
  messages: MessageListItem[];
  total: number;
  page: number;
  totalPages: number;
}

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
  initialInbox: PaginatedMessages;
  unreadCount: number;
  userId: string;
  initialConversation: ConversationMessage[];
}

type View = "inbox" | "conversation";

export function PortalMessagesClient({
  initialInbox,
  unreadCount: initialUnread,
  userId,
  initialConversation,
}: PortalMessagesClientProps) {
  const [view, setView] = useState<View>("conversation");
  const [inbox, setInbox] = useState(initialInbox);
  const [conversation, setConversation] = useState(initialConversation);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [selectedMessage, setSelectedMessage] = useState<Awaited<
    ReturnType<typeof getMessage>
  > | null>(null);
  const [isPending, startTransition] = useTransition();

  // Compose state
  const [isComposing, setIsComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [composeError, setComposeError] = useState<string | null>(null);
  const [isSending, startSendTransition] = useTransition();

  // ---------- Handlers ----------
  const refreshConversation = async () => {
    const data = await getConversationWithAdmin(userId);
    setConversation(JSON.parse(JSON.stringify(data)));
  };

  const refreshInbox = async (page = inbox.page) => {
    const data = await getInbox(userId, page);
    setInbox(JSON.parse(JSON.stringify(data)));
  };

  const handleSelectMessage = (messageId: string) => {
    startTransition(async () => {
      const msg = await getMessage(messageId);
      setSelectedMessage(JSON.parse(JSON.stringify(msg)));
      await refreshInbox();
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead(userId);
      await refreshInbox();
      await refreshConversation();
      setUnreadCount(0);
    });
  };

  const openCompose = () => {
    setSubject("");
    setBody("");
    setComposeError(null);
    setIsComposing(true);
  };

  const handleSend = () => {
    setComposeError(null);
    if (!subject.trim() || !body.trim()) {
      setComposeError("Subject and message are required.");
      return;
    }
    startSendTransition(async () => {
      try {
        await sendMessageToAdmin(subject, body);
        setSubject("");
        setBody("");
        setIsComposing(false);
        await refreshConversation();
        await refreshInbox();
        setView("conversation");
      } catch (err) {
        setComposeError(
          err instanceof Error ? err.message : "Failed to send message",
        );
      }
    });
  };

  // ---------- Single message detail view ----------
  if (selectedMessage) {
    return (
      <MessageDetail
        message={selectedMessage}
        onBack={() => setSelectedMessage(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button
            variant={view === "conversation" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("conversation")}
          >
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
            Conversation
          </Button>
          <Button
            variant={view === "inbox" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("inbox")}
          >
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1.5">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {view === "inbox" && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark All Read
            </Button>
          )}
          <Button size="sm" onClick={openCompose} disabled={isComposing}>
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
            New Message
          </Button>
        </div>
      </div>

      {/* Compose panel */}
      {isComposing && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 sm:p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">New Message to Admin</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your message will be delivered to the JETS School admin office.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsComposing(false)}
              disabled={isSending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="msg-subject">Subject</Label>
              <Input
                id="msg-subject"
                placeholder="What is your message about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-body">Message</Label>
              <Textarea
                id="msg-body"
                placeholder="Type your message to the admin office..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-32"
                disabled={isSending}
              />
            </div>

            {composeError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{composeError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsComposing(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !subject.trim() || !body.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                Send to Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {view === "conversation" ? (
        <ConversationView
          messages={conversation}
          userId={userId}
          isPending={isPending}
          onStartMessage={openCompose}
        />
      ) : (
        <InboxView
          inbox={inbox}
          isPending={isPending}
          onSelect={handleSelectMessage}
          onPageChange={(page) =>
            startTransition(async () => {
              await refreshInbox(page);
            })
          }
        />
      )}
    </div>
  );
}

// ---------- Conversation (parent ↔ admin chat-style) ----------

function ConversationView({
  messages,
  userId,
  isPending,
  onStartMessage,
}: {
  messages: ConversationMessage[];
  userId: string;
  isPending: boolean;
  onStartMessage: () => void;
}) {
  if (isPending) {
    return (
      <div className="rounded-xl border bg-card flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 text-center px-4">
        <MessageSquarePlus className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Have a question for the admin office? Start a conversation and we
          will get back to you soon.
        </p>
        <Button size="sm" className="mt-4" onClick={onStartMessage}>
          <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
          Send First Message
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
      {messages.map((m) => {
        const mine = m.senderId === userId;
        const date = new Date(m.createdAt);
        return (
          <div
            key={m.id}
            className={cn(
              "flex gap-3",
              mine ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                mine ? "bg-primary/10" : "bg-muted",
              )}
            >
              <UserIcon
                className={cn(
                  "h-4 w-4",
                  mine ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-xl border px-3 py-2 text-sm",
                mine
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/40 border-border",
              )}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-xs font-semibold">
                  {mine ? "You" : m.sender?.name || "Admin"}
                </span>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {format(date, "MMM d, h:mm a")}
                </span>
              </div>
              {m.subject && (
                <p className="text-sm font-medium text-foreground/90">
                  {m.subject}
                </p>
              )}
              <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-0.5">
                {m.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Inbox (traditional list) ----------

function InboxView({
  inbox,
  isPending,
  onSelect,
  onPageChange,
}: {
  inbox: PaginatedMessages;
  isPending: boolean;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="rounded-xl border bg-card">
      {isPending ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MessageList
          messages={inbox.messages}
          mode="inbox"
          onSelect={onSelect}
        />
      )}

      {inbox.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>
            Page {inbox.page} of {inbox.totalPages} ({inbox.total} messages)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={inbox.page <= 1 || isPending}
              onClick={() => onPageChange(inbox.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={inbox.page >= inbox.totalPages || isPending}
              onClick={() => onPageChange(inbox.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
