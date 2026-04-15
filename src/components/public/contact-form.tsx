"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Send, Loader2 } from "lucide-react";

const subjects = [
  "Admissions Inquiry",
  "Schedule a Visit",
  "General Question",
  "Donation/Support",
  "Other",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );
  const [subject, setSubject] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // Simulate network for now — will wire to email later.
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-3">
          Message received.
        </h3>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          Thanks for reaching out to JETS. A member of our team will get back
          to you within one business day.
        </p>
        <Button
          className="mt-8"
          variant="outline"
          onClick={() => {
            setStatus("idle");
            setSubject("");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-primary">*</span>
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your full name"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-primary">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-10"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(818) 555-0123"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject <span className="text-primary">*</span>
          </label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-10 w-full" size="default">
              <SelectValue placeholder="Choose a topic..." />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="subject" value={subject} required />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message <span className="text-primary">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us how we can help..."
          className="min-h-32"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <p className="text-xs text-muted-foreground">
          We reply to inquiries within one business day.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className="shadow-md shadow-primary/20"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
