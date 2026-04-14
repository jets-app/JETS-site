"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";

// ---------- Helpers ----------

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// ---------- Types ----------

export interface AlumniFilters {
  search?: string;
  graduationYear?: number;
  page?: number;
  pageSize?: number;
}

export interface AlumniFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  graduationYear: number;
  programCompleted?: string;
  photoUrl?: string;
  notes?: string;
}

// ---------- Actions ----------

export async function getAlumni(filters?: AlumniFilters) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters?.graduationYear) {
    where.graduationYear = filters.graduationYear;
  }

  if (filters?.search) {
    const search = filters.search.trim();
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [alumni, total] = await Promise.all([
    db.alumni.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: pageSize,
    }),
    db.alumni.count({ where }),
  ]);

  return {
    alumni,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAlumniById(id: string) {
  await requireAdmin();

  const alumni = await db.alumni.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          application: {
            select: { id: true, referenceNumber: true },
          },
        },
      },
    },
  });

  if (!alumni) {
    throw new Error("Alumni not found");
  }

  return alumni;
}

export async function createAlumni(data: AlumniFormData) {
  await requireAdmin();

  const alumni = await db.alumni.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      graduationYear: data.graduationYear,
      programCompleted: data.programCompleted?.trim() || null,
      photoUrl: data.photoUrl?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  return alumni;
}

export async function updateAlumni(id: string, data: AlumniFormData) {
  await requireAdmin();

  const alumni = await db.alumni.update({
    where: { id },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      graduationYear: data.graduationYear,
      programCompleted: data.programCompleted?.trim() || null,
      photoUrl: data.photoUrl?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  return alumni;
}

export async function deleteAlumni(id: string) {
  await requireAdmin();

  await db.alumni.delete({ where: { id } });
  return { success: true };
}

export async function moveToAlumni(studentId: string, graduationYear: number) {
  await requireAdmin();

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      application: { select: { status: true } },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check if already an alumni
  const existing = await db.alumni.findUnique({
    where: { studentId },
  });

  if (existing) {
    throw new Error("This student is already in the alumni records");
  }

  const alumni = await db.alumni.create({
    data: {
      studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      photoUrl: student.photoUrl,
      address: [student.addressLine1, student.addressLine2, student.city, student.state, student.zipCode]
        .filter(Boolean)
        .join(", ") || null,
      graduationYear,
    },
  });

  return alumni;
}

export async function getAlumniByYear(year: number) {
  await requireAdmin();

  const alumni = await db.alumni.findMany({
    where: { graduationYear: year },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return alumni;
}

export async function getAlumniYears() {
  await requireAdmin();

  const years = await db.alumni.groupBy({
    by: ["graduationYear"],
    _count: { id: true },
    orderBy: { graduationYear: "desc" },
  });

  return years.map((y) => ({
    year: y.graduationYear,
    count: y._count.id,
  }));
}

export interface AlumniCSVRow {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  graduationYear: number;
  programCompleted?: string;
}

export async function importAlumniFromCSV(data: AlumniCSVRow[]) {
  await requireAdmin();

  if (!data.length) {
    throw new Error("No data to import");
  }

  const results = await db.alumni.createMany({
    data: data.map((row) => ({
      firstName: row.firstName.trim(),
      lastName: row.lastName.trim(),
      email: row.email?.trim() || null,
      phone: row.phone?.trim() || null,
      graduationYear: Number(row.graduationYear),
      programCompleted: row.programCompleted?.trim() || null,
    })),
    skipDuplicates: true,
  });

  return { imported: results.count };
}

export async function exportAlumniToCSV() {
  await requireAdmin();

  const alumni = await db.alumni.findMany({
    orderBy: [{ graduationYear: "desc" }, { lastName: "asc" }],
  });

  const headers = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "graduationYear",
    "programCompleted",
    "notes",
  ];

  const rows = alumni.map((a) =>
    [
      a.firstName,
      a.lastName,
      a.email ?? "",
      a.phone ?? "",
      a.address ?? "",
      a.graduationYear.toString(),
      a.programCompleted ?? "",
      (a.notes ?? "").replace(/\n/g, " "),
    ]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
