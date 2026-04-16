"use server";

import { db } from "@/server/db";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

const inquiryFormSchema = contactFormSchema.extend({
  studentAge: z.number().optional(),
  interestedIn: z.string().optional(),
  preferredDate: z.string().optional(),
  source: z.string().default("contact_form"),
});

export async function submitContactForm(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    subject: (formData.get("subject") as string) || undefined,
    message: (formData.get("message") as string) || undefined,
  };

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const inquiry = await db.inquiry.create({
    data: {
      ...parsed.data,
      source: "contact_form",
    },
  });

  return { success: true, id: inquiry.id };
}

export async function submitInquiryForm(data: z.infer<typeof inquiryFormSchema>) {
  const parsed = inquiryFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const inquiry = await db.inquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
      studentAge: parsed.data.studentAge,
      interestedIn: parsed.data.interestedIn,
      preferredDate: parsed.data.preferredDate
        ? new Date(parsed.data.preferredDate)
        : undefined,
      source: parsed.data.source,
    },
  });

  return { success: true, id: inquiry.id };
}

export async function getInquiries(filters?: {
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 25;
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.source) where.source = filters.source;

  const [inquiries, total] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.inquiry.count({ where }),
  ]);

  return { inquiries, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateInquiryStatus(
  id: string,
  status: string,
  notes?: string,
) {
  return db.inquiry.update({
    where: { id },
    data: {
      status: status as "NEW" | "CONTACTED" | "TOUR_SCHEDULED" | "TOUR_COMPLETED" | "CONVERTED" | "CLOSED",
      ...(notes ? { notes } : {}),
    },
  });
}

export async function updateInquiry(
  id: string,
  data: {
    assignedTo?: string;
    followUpAt?: string;
    notes?: string;
    status?: string;
  },
) {
  return db.inquiry.update({
    where: { id },
    data: {
      ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
      ...(data.followUpAt ? { followUpAt: new Date(data.followUpAt) } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.status
        ? { status: data.status as "NEW" | "CONTACTED" | "TOUR_SCHEDULED" | "TOUR_COMPLETED" | "CONVERTED" | "CLOSED" }
        : {}),
    },
  });
}
