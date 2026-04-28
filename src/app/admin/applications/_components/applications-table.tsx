"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";
import {
  archiveApplication,
  unarchiveApplication,
  deleteApplication,
} from "@/server/actions/admin.actions";

interface ApplicationRow {
  id: string;
  referenceNumber: string;
  status: ApplicationStatus;
  academicYear: string;
  completionPct: number;
  createdAt: Date;
  submittedAt: Date | null;
  archivedAt?: Date | null;
  student: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  } | null;
  parent: {
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApplicationsTableProps {
  applications: ApplicationRow[];
  pagination: Pagination;
  academicYears: string[];
  currentFilters: {
    search: string;
    status: string;
    year: string;
  };
  /** Only ADMIN sees archive + delete row actions. */
  canManage?: boolean;
}

const ALL_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "OFFICE_REVIEW", label: "Office Review" },
  { value: "PRINCIPAL_REVIEW", label: "Principal Review" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DOCUMENTS_PENDING", label: "Documents Pending" },
  { value: "SCHOLARSHIP_REVIEW", label: "Scholarship Review" },
  { value: "ENROLLED", label: "Enrolled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export function ApplicationsTable({
  applications,
  pagination,
  academicYears,
  currentFilters,
  canManage = false,
}: ApplicationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentFilters.search);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      // Reset to page 1 on filter change unless explicitly setting page
      if (!("page" in updates)) {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateParams({ search: searchValue });
  }, [searchValue, updateParams]);

  const columns: ColumnDef<ApplicationRow>[] = [
    {
      accessorKey: "referenceNumber",
      header: "Reference #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.referenceNumber}
        </span>
      ),
    },
    {
      id: "studentName",
      header: "Student Name",
      cell: ({ row }) => {
        const student = row.original.student;
        if (!student) {
          return (
            <span className="text-muted-foreground italic">
              No student info
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2.5">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt=""
                className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>
            )}
            <span className="font-medium">
              {student.firstName} {student.lastName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "submittedAt",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() =>
            updateParams({
              sortBy: "submittedAt",
              sortOrder:
                searchParams.get("sortOrder") === "asc" ? "desc" : "asc",
            })
          }
        >
          Date Submitted
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => {
        const date = row.original.submittedAt ?? row.original.createdAt;
        return (
          <span className="text-muted-foreground text-xs">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "completionPct",
      header: "Completion",
      cell: ({ row }) => {
        const pct = row.original.completionPct;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {pct}%
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActions row={row.original} canManage={canManage} />
      ),
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or reference..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={currentFilters.status}
          onChange={(e) => updateParams({ status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={currentFilters.year}
          onChange={(e) => updateParams({ year: e.target.value })}
        >
          <option value="">All Years</option>
          {(() => {
            const uniqueYears = Array.from(new Set([...academicYears, currentFilters.year].filter(Boolean)));
            return uniqueYears.sort().reverse().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ));
          })()}
        </select>

        <Button variant="outline" size="default" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/applications/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {(pagination.page - 1) * pagination.pageSize + 1}
          </span>
          {" - "}
          <span className="font-medium text-foreground">
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {pagination.total}
          </span>{" "}
          applications
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={pagination.page <= 1 || isPending}
            onClick={() =>
              updateParams({ page: String(pagination.page - 1) })
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 font-medium">
            {pagination.page} / {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={
              pagination.page >= pagination.totalPages || isPending
            }
            onClick={() =>
              updateParams({ page: String(pagination.page + 1) })
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RowActions({
  row,
  canManage,
}: {
  row: ApplicationRow;
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isArchived = !!row.archivedAt;

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    startTransition(async () => {
      if (isArchived) {
        await unarchiveApplication(row.id);
      } else {
        await archiveApplication(row.id);
      }
      router.refresh();
    });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    const name = row.student
      ? `${row.student.firstName} ${row.student.lastName}`
      : row.referenceNumber;
    if (!confirm(`Permanently delete the application for ${name}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deleteApplication(row.id);
      router.refresh();
    });
  }

  function handleView(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/admin/applications/${row.id}`);
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(!open)}
        disabled={isPending}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-44 rounded-lg border bg-popover shadow-lg z-50 py-1">
            <button
              onClick={handleView}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </button>
            {canManage && (
              <>
                <button
                  onClick={handleArchive}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                >
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="h-3.5 w-3.5" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </>
                  )}
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
