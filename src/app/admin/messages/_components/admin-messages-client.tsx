"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageList,
  type MessageListItem,
} from "@/components/messaging/message-list";
import { MessageDetail } from "@/components/messaging/message-detail";
import { MessageCompose } from "@/components/messaging/message-compose";
import {
  getInbox,
  getSentMessages,
  getMessage,
  markAllAsRead,
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
} from "@/server/actions/message.actions";
import {
  Plus,
  CheckCheck,
  Pencil,
  Trash2,
  Loader2,
  Inbox,
  Send,
  FileText,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedMessages {
  messages: MessageListItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface AdminMessagesClientProps {
  initialInbox: PaginatedMessages;
  initialSent: PaginatedMessages;
  initialTemplates: Template[];
  unreadCount: number;
  academicYears: string[];
  userId: string;
}

export function AdminMessagesClient({
  initialInbox,
  initialSent,
  initialTemplates,
  unreadCount: initialUnread,
  academicYears,
  userId,
}: AdminMessagesClientProps) {
  const [inbox, setInbox] = useState(initialInbox);
  const [sent, setSent] = useState(initialSent);
  const [templates, setTemplates] = useState(initialTemplates);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [selectedMessage, setSelectedMessage] = useState<Awaited<
    ReturnType<typeof getMessage>
  > | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateError, setTemplateError] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const [newInbox, newSent, newTemplates] = await Promise.all([
        getInbox(userId),
        getSentMessages(userId),
        getMessageTemplates(),
      ]);
      setInbox(JSON.parse(JSON.stringify(newInbox)));
      setSent(JSON.parse(JSON.stringify(newSent)));
      setTemplates(JSON.parse(JSON.stringify(newTemplates)));
    });
  }, [userId]);

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

  const handleSaveTemplate = () => {
    setTemplateError(null);
    startTransition(async () => {
      try {
        if (editingTemplate) {
          await updateMessageTemplate(editingTemplate.id, {
            name: templateName,
            subject: templateSubject,
            body: templateBody,
          });
        } else {
          await createMessageTemplate(templateName, templateSubject, templateBody);
        }
        const newTemplates = await getMessageTemplates();
        setTemplates(JSON.parse(JSON.stringify(newTemplates)));
        resetTemplateForm();
      } catch (err) {
        setTemplateError(
          err instanceof Error ? err.message : "Failed to save template"
        );
      }
    });
  };

  const handleDeleteTemplate = (id: string) => {
    startTransition(async () => {
      await deleteMessageTemplate(id);
      const newTemplates = await getMessageTemplates();
      setTemplates(JSON.parse(JSON.stringify(newTemplates)));
    });
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setShowTemplateForm(true);
  };

  const resetTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
    setTemplateName("");
    setTemplateSubject("");
    setTemplateBody("");
    setTemplateError(null);
  };

  // If viewing a message detail
  if (selectedMessage) {
    return (
      <MessageDetail
        message={selectedMessage}
        onBack={() => setSelectedMessage(null)}
      />
    );
  }

  // If composing
  if (showCompose) {
    return (
      <MessageCompose
        templates={templates}
        academicYears={academicYears}
        onSent={() => {
          setShowCompose(false);
          refreshData();
        }}
        onCancel={() => setShowCompose(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Compose
        </Button>
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

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="h-3.5 w-3.5 mr-1.5" />
            Inbox
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <div className="rounded-xl border bg-card mt-4">
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
            {inbox.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                <span>
                  Page {inbox.page} of {inbox.totalPages} ({inbox.total}{" "}
                  messages)
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
        </TabsContent>

        <TabsContent value="sent">
          <div className="rounded-xl border bg-card mt-4">
            {isPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MessageList
                messages={sent.messages}
                mode="sent"
                onSelect={handleSelectMessage}
              />
            )}
            {sent.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                <span>
                  Page {sent.page} of {sent.totalPages} ({sent.total} messages)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sent.page <= 1 || isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const data = await getSentMessages(
                          userId,
                          sent.page - 1
                        );
                        setSent(JSON.parse(JSON.stringify(data)));
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sent.page >= sent.totalPages || isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const data = await getSentMessages(
                          userId,
                          sent.page + 1
                        );
                        setSent(JSON.parse(JSON.stringify(data)));
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4 mt-4">
            {/* Create template button */}
            {!showTemplateForm && (
              <Button
                variant="outline"
                onClick={() => {
                  resetTemplateForm();
                  setShowTemplateForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Template
              </Button>
            )}

            {/* Template form */}
            {showTemplateForm && (
              <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
                <h3 className="text-sm font-semibold">
                  {editingTemplate ? "Edit Template" : "New Template"}
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="e.g. Welcome Message"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="Message subject"
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Body</label>
                    <Textarea
                      placeholder="Message body..."
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                </div>
                {templateError && (
                  <p className="text-sm text-destructive">{templateError}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetTemplateForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={
                      isPending ||
                      !templateName.trim() ||
                      !templateSubject.trim() ||
                      !templateBody.trim()
                    }
                  >
                    {isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    )}
                    {editingTemplate ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            )}

            {/* Template list */}
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No templates yet. Create one to speed up composing messages.
                  </p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Subject: {template.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
