"use client";

import { useState } from "react";
import { sendMessage } from "@/server/actions/message.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";

interface MessageParentDialogProps {
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string | null;
  studentName?: string;
}

export function MessageParentDialog({
  parentId,
  parentName,
  parentEmail,
  parentPhone,
  studentName,
}: MessageParentDialogProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<
    { type: "success" | "error"; msg: string } | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setStatus({ type: "error", msg: "Please enter a subject and message." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await sendMessage(parentId, subject, body);
      setStatus({ type: "success", msg: "Message sent successfully!" });
      setSubject("");
      setBody("");
      setTimeout(() => {
        setOpen(false);
        setStatus(null);
      }, 1500);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to send message",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Message Parent
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Send Message to Parent</DialogTitle>
          <DialogDescription>
            {studentName
              ? `Message regarding ${studentName}`
              : "Sending a direct message to the parent"}
          </DialogDescription>
        </DialogHeader>

        {/* Parent contact info */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
          <div className="font-medium">{parentName}</div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Mail className="h-3 w-3" />
            <span>{parentEmail}</span>
          </div>
          {parentPhone && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Phone className="h-3 w-3" />
              <span>{parentPhone}</span>
            </div>
          )}
        </div>

        {/* Status */}
        {status && (
          <div
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-destructive/20 bg-destructive/5 text-destructive"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            {status.msg}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            This message will be sent to the parent&apos;s inbox and emailed to{" "}
            <span className="font-medium">{parentEmail}</span>.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
