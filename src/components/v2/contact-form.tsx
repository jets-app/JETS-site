"use client";

import { useState } from "react";
import { submitContactForm } from "@/server/actions/inquiry.actions";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await submitContactForm(formData);
    if (result.success) {
      setStatus("sent");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="py-16 text-center">
        <div
          className="v2-display italic mb-4"
          style={{ fontSize: "2.5rem", color: "var(--v2-burgundy)" }}
        >
          ✦
        </div>
        <h3
          className="v2-display mb-3"
          style={{ fontSize: "1.75rem", color: "var(--v2-ink)" }}
        >
          Letter received.
        </h3>
        <p
          className="v2-editorial italic"
          style={{ fontSize: "16.5px", color: "var(--v2-ink-muted)", lineHeight: 1.65 }}
        >
          We will reply within two or three business days.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormField label="Your Name" name="name" required />
      <FormField label="Electronic Post" name="email" type="email" required />
      <FormField label="By Telephone" name="phone" type="tel" />
      <FormField label="The Matter at Hand" name="subject" />
      <div>
        <label
          htmlFor="message"
          className="block v2-byline mb-2"
          style={{ color: "var(--v2-ink-muted)" }}
        >
          Your Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          className="w-full bg-transparent v2-editorial py-2 resize-none focus:outline-none"
          style={{
            fontSize: "17px",
            color: "var(--v2-ink)",
            borderBottom: "1px solid var(--v2-rule)",
          }}
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="v2-smallcaps v2-link-underline disabled:opacity-50"
          style={{ color: "var(--v2-burgundy)", cursor: "pointer" }}
        >
          {status === "sending" ? "Sending…" : "Dispatch the Letter"} &nbsp;→
        </button>
        {status === "error" && (
          <p className="mt-3 v2-editorial" style={{ color: "var(--v2-burgundy)", fontSize: "14px" }}>
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block v2-byline mb-2"
        style={{ color: "var(--v2-ink-muted)" }}
      >
        {label}
        {required && <span style={{ color: "var(--v2-burgundy)" }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-transparent v2-editorial py-2 focus:outline-none"
        style={{
          fontSize: "17px",
          color: "var(--v2-ink)",
          borderBottom: "1px solid var(--v2-rule)",
        }}
      />
    </div>
  );
}
