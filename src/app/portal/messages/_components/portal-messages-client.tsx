"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageList,
  type MessageListItem,
} from "@/components/messaging/message-list";
import { MessageDetail } from "@/components/messaging/message-detail";
import {
  getInbox,
  getMessage,
  markAllAsRead,
} from "@/server/actions/message.actions";
import { CheckCheck, Loader2 } from "lucide-react";

interface PaginatedMessages {
  messages: MessageListItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface PortalMessagesClientProps {
  initialInbox: PaginatedMessages;
  unreadCount: number;
  userId: string;
}

export function PortalMessagesClient({
  initialInbox,
  unreadCount: initialUnread,
  userId,
}: PortalMessagesClientProps) {
  const [inbox, setInbox] = useState(initialInbox);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [selectedMessage, setSelectedMessage] = useState<Awaited<
    ReturnType<typeof getMessage>
  > | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectMessage = (messageId: string) => {
    startTransition(async () => {
      const msg = await getMessage(messageId);
      setSelectedMessage(JSON.parse(JSON.stringify(msg)));
      // Refresh inbox to update read status
      const newInbox = await getInbox(userId);
      setInbox(JSON.parse(JSON.stringify(newInbox)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead(userId);
      const newInbox = await getInbox(userId);
      setInbox(JSON.parse(JSON.stringify(newInbox)));
      setUnreadCount(0);
    });
  };

  // Viewing a single message
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
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
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
      </div>

      {/* Message List */}
      <div className="rounded-xl border bg-card">
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MessageList
            messages={inbox.messages}
            mode="inbox"
            onSelect={handleSelectMessage}
          />
        )}

        {/* Pagination */}
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
                onClick={() =>
                  startTransition(async () => {
                    const data = await getInbox(userId, inbox.page - 1);
                    setInbox(JSON.parse(JSON.stringify(data)));
                  })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={inbox.page >= inbox.totalPages || isPending}
                onClick={() =>
                  startTransition(async () => {
                    const data = await getInbox(userId, inbox.page + 1);
                    setInbox(JSON.parse(JSON.stringify(data)));
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
