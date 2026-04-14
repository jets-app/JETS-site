"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { DonationFrequency } from "@prisma/client";

// ---------- Helpers ----------

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// ---------- Types ----------

export interface DonorFilters {
  search?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

export interface DonorFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  tags?: string[];
  notes?: string;
}

export interface DonationFormData {
  amount: number; // in cents
  method?: string;
  frequency?: DonationFrequency;
  campaign?: string;
  purpose?: string;
  donatedAt?: string; // ISO string
  notes?: string;
}

// ---------- Donor CRUD ----------

export async function getDonors(filters?: DonorFilters) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters?.search) {
    const search = filters.search.trim();
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filters?.tags?.length) {
    where.tags = { hasSome: filters.tags };
  }

  const [donors, total] = await Promise.all([
    db.donor.findMany({
      where,
      include: {
        donations: {
          select: { amount: true, donatedAt: true },
          orderBy: { donatedAt: "desc" },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: pageSize,
    }),
    db.donor.count({ where }),
  ]);

  const enriched = donors.map((d) => ({
    ...d,
    lifetimeTotal: d.donations.reduce((sum, don) => sum + don.amount, 0),
    donationCount: d.donations.length,
    lastDonation: d.donations[0]?.donatedAt ?? null,
  }));

  return {
    donors: enriched,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDonorById(id: string) {
  await requireAdmin();

  const donor = await db.donor.findUnique({
    where: { id },
    include: {
      donations: {
        orderBy: { donatedAt: "desc" },
      },
      receipts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!donor) {
    throw new Error("Donor not found");
  }

  const lifetimeTotal = donor.donations.reduce((sum, d) => sum + d.amount, 0);

  const currentYear = new Date().getFullYear();
  const thisYearTotal = donor.donations
    .filter((d) => d.donatedAt.getFullYear() === currentYear)
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    ...donor,
    lifetimeTotal,
    thisYearTotal,
  };
}

export async function createDonor(data: DonorFormData) {
  await requireAdmin();

  const donor = await db.donor.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      zipCode: data.zipCode?.trim() || null,
      country: data.country?.trim() || "United States",
      tags: data.tags ?? [],
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/admin/donors");
  return donor;
}

export async function updateDonor(id: string, data: DonorFormData) {
  await requireAdmin();

  const donor = await db.donor.update({
    where: { id },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      zipCode: data.zipCode?.trim() || null,
      country: data.country?.trim() || "United States",
      tags: data.tags ?? [],
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/admin/donors");
  revalidatePath(`/admin/donors/${id}`);
  return donor;
}

export async function deleteDonor(id: string) {
  await requireAdmin();

  await db.donor.delete({ where: { id } });
  revalidatePath("/admin/donors");
  return { success: true };
}

// ---------- Donations ----------

export async function addDonation(donorId: string, data: DonationFormData) {
  await requireAdmin();

  const donation = await db.donation.create({
    data: {
      donorId,
      amount: data.amount,
      method: data.method?.trim() || null,
      frequency: data.frequency ?? "ONE_TIME",
      campaign: data.campaign?.trim() || null,
      purpose: data.purpose?.trim() || null,
      donatedAt: data.donatedAt ? new Date(data.donatedAt) : new Date(),
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/admin/donors");
  revalidatePath(`/admin/donors/${donorId}`);
  return donation;
}

export async function getDonationsForDonor(donorId: string) {
  await requireAdmin();

  return db.donation.findMany({
    where: { donorId },
    orderBy: { donatedAt: "desc" },
  });
}

// ---------- Stats ----------

export async function getDonorStats() {
  await requireAdmin();

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01T00:00:00Z`);

  const [
    totalDonors,
    allDonations,
    thisYearDonations,
    recurringDonors,
    recentDonations,
  ] = await Promise.all([
    db.donor.count(),
    db.donation.aggregate({ _sum: { amount: true } }),
    db.donation.aggregate({
      _sum: { amount: true },
      where: { donatedAt: { gte: yearStart } },
    }),
    db.donation.groupBy({
      by: ["donorId"],
      where: {
        frequency: { not: "ONE_TIME" },
      },
    }),
    db.donation.findMany({
      take: 10,
      orderBy: { donatedAt: "desc" },
      include: {
        donor: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  return {
    totalDonors,
    totalRaised: allDonations._sum.amount ?? 0,
    raisedThisYear: thisYearDonations._sum.amount ?? 0,
    activeRecurring: recurringDonors.length,
    recentDonations,
  };
}

// ---------- Receipts ----------

export async function generateDonorReceipt(
  donorId: string,
  type: "per-donation" | "annual",
  year?: number
) {
  await requireAdmin();

  const donor = await db.donor.findUnique({
    where: { id: donorId },
    include: { donations: true },
  });

  if (!donor) throw new Error("Donor not found");

  let amount = 0;
  const targetYear = year ?? new Date().getFullYear();

  if (type === "annual") {
    amount = donor.donations
      .filter((d) => d.donatedAt.getFullYear() === targetYear)
      .reduce((sum, d) => sum + d.amount, 0);
  } else {
    amount = donor.donations.reduce((sum, d) => sum + d.amount, 0);
  }

  const receipt = await db.donorReceipt.create({
    data: {
      donorId,
      type,
      year: type === "annual" ? targetYear : null,
      amount,
    },
  });

  return receipt;
}

export async function getDonorReceipts(donorId: string) {
  await requireAdmin();

  return db.donorReceipt.findMany({
    where: { donorId },
    orderBy: { createdAt: "desc" },
  });
}

// ---------- Export ----------

export async function exportDonorsToCSV() {
  await requireAdmin();

  const donors = await db.donor.findMany({
    include: {
      donations: { select: { amount: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const headers = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "zipCode",
    "country",
    "tags",
    "lifetimeTotal",
    "donationCount",
  ];

  const rows = donors.map((d) => {
    const lifetime = d.donations.reduce((s, don) => s + don.amount, 0);
    return [
      d.firstName,
      d.lastName,
      d.email ?? "",
      d.phone ?? "",
      d.address ?? "",
      d.city ?? "",
      d.state ?? "",
      d.zipCode ?? "",
      d.country ?? "",
      d.tags.join(";"),
      formatCurrency(lifetime),
      d.donations.length.toString(),
    ]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

// ---------- Search / Analytics ----------

export async function searchDonors(query: string) {
  await requireAdmin();

  if (!query.trim()) return [];

  return db.donor.findMany({
    where: {
      OR: [
        { firstName: { contains: query.trim(), mode: "insensitive" } },
        { lastName: { contains: query.trim(), mode: "insensitive" } },
        { email: { contains: query.trim(), mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    take: 10,
    orderBy: [{ lastName: "asc" }],
  });
}

export async function getDonationsByCampaign() {
  await requireAdmin();

  const campaigns = await db.donation.groupBy({
    by: ["campaign"],
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return campaigns.map((c) => ({
    campaign: c.campaign ?? "Uncategorized",
    total: c._sum.amount ?? 0,
    count: c._count.id,
  }));
}

export async function getTopDonors(limit = 10) {
  await requireAdmin();

  const donors = await db.donor.findMany({
    include: {
      donations: { select: { amount: true } },
    },
  });

  return donors
    .map((d) => ({
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      lifetimeTotal: d.donations.reduce((s, don) => s + don.amount, 0),
      donationCount: d.donations.length,
    }))
    .sort((a, b) => b.lifetimeTotal - a.lifetimeTotal)
    .slice(0, limit);
}
