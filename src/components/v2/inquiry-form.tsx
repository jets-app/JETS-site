"use client";

import { useState } from "react";
import { submitInquiryForm } from "@/server/actions/inquiry.actions";

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      subject: "Admissions Inquiry",
      message: (fd.get("message") as string) || undefined,
      studentAge: fd.get("studentAge") ? Number(fd.get("studentAge")) : undefined,
      interestedIn: (fd.get("interestedIn") as string) || undefined,
      preferredDate: (fd.get("preferredDate") as string) || undefined,
      source: "inquiry_form",
    };

    const result = await submitInquiryForm(data);
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
          Inquiry received.
        </h3>
        <p
          className="v2-editorial italic"
          style={{ fontSize: "16.5px", color: "var(--v2-ink-muted)", lineHeight: 1.65 }}
        >
          Our admissions team will reach out within one to two business days.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Parent / Guardian Name" name="name" required />
        <FormField label="Email Address" name="email" type="email" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Phone Number" name="phone" type="tel" />
        <FormField label="Student's Age" name="studentAge" type="number" />
      </div>
      <div>
        <label
          htmlFor="interestedIn"
          className="block v2-byline mb-2"
          style={{ color: "var(--v2-ink-muted)" }}
        >
          Programs of Interest
        </label>
        <select
          id="interestedIn"
          name="interestedIn"
          className="w-full bg-transparent v2-editorial py-2 focus:outline-none appearance-none cursor-pointer"
          style={{
            fontSize: "17px",
            color: "var(--v2-ink)",
            borderBottom: "1px solid var(--v2-rule)",
          }}
        >
          <option value="">Select a program area...</option>
          <option value="judaic_studies">Judaic Studies</option>
          <option value="applied_technology">Applied Technology</option>
          <option value="skilled_trades">Skilled Trades</option>
          <option value="business">Business & Enterprise</option>
          <option value="academic">Academic Foundations / GED</option>
          <option value="undecided">Undecided — would like to learn more</option>
        </select>
      </div>
      <FormField label="Preferred Visit Date" name="preferredDate" type="date" />
      <div>
        <label
          htmlFor="message"
          className="block v2-byline mb-2"
          style={{ color: "var(--v2-ink-muted)" }}
        >
          Questions or Comments
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
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
          {status === "sending" ? "Sending…" : "Submit Inquiry"} &nbsp;→
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
