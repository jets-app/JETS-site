"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/shared/link-button";
import { AlumniForm } from "./alumni-form";
import { CSVImport } from "./csv-import";
import { exportAlumniToCSV } from "@/server/actions/alumni.actions";
import {
  GraduationCap,
  Plus,
  Upload,
  Download,
  Search,
  User,
} from "lucide-react";
import type { Alumni } from "@prisma/client";

interface AlumniDashboardProps {
  alumni: Alumni[];
  total: number;
  years: { year: number; count: number }[];
  selectedYear: number | null;
  search: string;
}

export function AlumniDashboard({
  alumni,
  total,
  years,
  selectedYear,
  search: initialSearch,
}: AlumniDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedYear) params.set("year", selectedYear.toString());
    startTransition(() => {
      router.push(`/admin/alumni?${params.toString()}`);
    });
  }

  function handleYearSelect(year: number | null) {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (year) params.set("year", year.toString());
    startTransition(() => {
      router.push(`/admin/alumni?${params.toString()}`);
    });
  }

  async function handleExport() {
    try {
      const csv = await exportAlumniToCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alumni-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently handle
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Alumni Management
          </h1>
          <p className="text-muted-foreground">
            {total} alumni across {years.length} graduation year
            {years.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => { setShowForm(true); setShowImport(false); }}>
            <Plus className="size-4 mr-1.5" />
            Add Alumni
          </Button>
          <Button
            variant="outline"
            onClick={() => { setShowImport(true); setShowForm(false); }}
          >
            <Upload className="size-4 mr-1.5" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Add / Import forms */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            <AlumniForm onClose={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {showImport && (
        <Card>
          <CardContent className="pt-4">
            <CSVImport onClose={() => setShowImport(false)} />
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending}>
          Search
        </Button>
      </form>

      {/* Year Tabs */}
      {years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedYear === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleYearSelect(null)}
          >
            All Years
          </Button>
          {years.map((y) => (
            <Button
              key={y.year}
              variant={selectedYear === y.year ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearSelect(y.year)}
            >
              {y.year}
              <Badge variant="secondary" className="ml-1.5">
                {y.count}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {/* Alumni Grid */}
      {alumni.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="mx-auto size-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No alumni found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {initialSearch
                ? "Try adjusting your search."
                : "Add your first alumni record to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {alumni.map((a) => (
            <LinkButton
              key={a.id}
              href={`/admin/alumni/${a.id}`}
              variant="ghost"
              className="h-auto p-0 block text-left"
            >
              <Card className="h-full hover:ring-2 hover:ring-primary/20 transition-all">
                <CardContent className="flex items-center gap-3 py-4">
                  {a.photoUrl ? (
                    <img
                      src={a.photoUrl}
                      alt={`${a.firstName} ${a.lastName}`}
                      className="size-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {a.firstName} {a.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Class of {a.graduationYear}
                    </p>
                    {a.programCompleted && (
                      <p className="text-xs text-muted-foreground truncate">
                        {a.programCompleted}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </LinkButton>
          ))}
        </div>
      )}
    </div>
  );
}
