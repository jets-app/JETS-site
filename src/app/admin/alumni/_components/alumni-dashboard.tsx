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
import {
  exportAlumniToCSV,
  toggleFeaturedAlumni,
} from "@/server/actions/alumni.actions";
import {
  GraduationCap,
  Plus,
  Upload,
  Download,
  Search,
  User,
  MapPin,
  Briefcase,
  Star,
  Filter,
  X,
} from "lucide-react";
import type { Alumni } from "@prisma/client";

interface AlumniStats {
  total: number;
  featured: number;
  byYear: { year: number; count: number }[];
  byProgram: { program: string; count: number }[];
}

interface AlumniDashboardProps {
  alumni: Alumni[];
  total: number;
  years: { year: number; count: number }[];
  programs: string[];
  selectedYear: number | null;
  selectedProgram: string | null;
  selectedLocation: string | null;
  search: string;
  stats: AlumniStats;
}

export function AlumniDashboard({
  alumni,
  total,
  years,
  programs,
  selectedYear,
  selectedProgram,
  selectedLocation,
  search: initialSearch,
  stats,
}: AlumniDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [locationFilter, setLocationFilter] = useState(selectedLocation ?? "");

  function buildUrl(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    const values: Record<string, string | null> = {
      search: searchQuery || null,
      year: selectedYear?.toString() ?? null,
      program: selectedProgram ?? null,
      location: locationFilter || null,
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) {
      if (v) params.set(k, v);
    }
    return `/admin/alumni?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl({ search: searchQuery || null }));
    });
  }

  function handleYearSelect(year: number | null) {
    startTransition(() => {
      router.push(buildUrl({ year: year?.toString() ?? null }));
    });
  }

  function handleProgramSelect(program: string | null) {
    startTransition(() => {
      router.push(buildUrl({ program }));
    });
  }

  function handleLocationFilter() {
    startTransition(() => {
      router.push(buildUrl({ location: locationFilter || null }));
    });
  }

  function clearFilters() {
    setSearchQuery("");
    setLocationFilter("");
    startTransition(() => {
      router.push("/admin/alumni");
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

  async function handleToggleFeatured(id: string) {
    try {
      await toggleFeaturedAlumni(id);
    } catch {
      // silently handle
    }
  }

  const hasFilters = selectedYear || selectedProgram || selectedLocation || initialSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Alumni Directory</h1>
          <p className="admin-page-subtitle">
            {total} alumni across {years.length} graduation year
            {years.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setShowForm(true); setShowImport(false); }}
            className="admin-btn-primary"
          >
            <Plus className="size-4" />
            Add Alumni
          </button>
          <button
            onClick={() => { setShowImport(true); setShowForm(false); }}
            className="admin-btn-secondary"
          >
            <Upload className="size-4" />
            Import CSV
          </button>
          <button onClick={handleExport} className="admin-btn-secondary">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-label">Total Alumni</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.featured}</div>
          <div className="admin-stat-label">Featured</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.byYear.length}</div>
          <div className="admin-stat-label">Grad Years</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.byProgram.length}</div>
          <div className="admin-stat-label">Programs</div>
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

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                placeholder="Search by name, program, role, company, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input pl-9"
              />
            </div>
            <button type="submit" className="admin-btn-secondary" disabled={isPending}>
              Search
            </button>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`admin-btn-secondary ${showFilters ? "!border-[#A30018] !text-[#A30018]" : ""}`}
          >
            <Filter className="size-4" />
            Filters
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="admin-btn-ghost">
              <X className="size-4" />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="admin-card p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Program filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Program</label>
                <select
                  value={selectedProgram ?? ""}
                  onChange={(e) => handleProgramSelect(e.target.value || null)}
                  className="admin-input"
                >
                  <option value="">All Programs</option>
                  {programs.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {/* Location filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Location (city)</label>
                <div className="flex gap-2">
                  <input
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="e.g. Los Angeles"
                    className="admin-input"
                  />
                  <button onClick={handleLocationFilter} className="admin-btn-secondary shrink-0">
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Year Tabs */}
      {years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleYearSelect(null)}
            className={selectedYear === null ? "admin-btn-primary" : "admin-btn-secondary"}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            All Years
          </button>
          {years.map((y) => (
            <button
              key={y.year}
              onClick={() => handleYearSelect(y.year)}
              className={selectedYear === y.year ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              {y.year}
              <span className="admin-badge admin-badge-gray ml-1.5" style={{ fontSize: "10px", padding: "1px 6px" }}>
                {y.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Alumni Grid */}
      {alumni.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <GraduationCap className="mx-auto size-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium text-gray-700">No alumni found</p>
          <p className="text-sm text-gray-400 mt-1">
            {initialSearch
              ? "Try adjusting your search or filters."
              : "Add your first alumni record to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {alumni.map((a) => (
            <div
              key={a.id}
              className="admin-card admin-card-interactive relative overflow-hidden"
            >
              {a.isFeatured && (
                <div className="absolute top-3 right-3">
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                </div>
              )}
              <LinkButton
                href={`/admin/alumni/${a.id}`}
                variant="ghost"
                className="h-auto p-0 block text-left w-full"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {a.photoUrl ? (
                      <img
                        src={a.photoUrl}
                        alt={`${a.firstName} ${a.lastName}`}
                        className="size-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-gray-500">
                          {a.firstName[0]}{a.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {a.firstName} {a.lastName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Class of {a.graduationYear}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {(a.currentRole || a.currentCompany) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Briefcase className="size-3 shrink-0 text-gray-400" />
                        <span className="truncate">
                          {a.currentRole}{a.currentRole && a.currentCompany ? " at " : ""}{a.currentCompany}
                        </span>
                      </div>
                    )}
                    {a.programCompleted && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <GraduationCap className="size-3 shrink-0 text-gray-400" />
                        <span className="truncate">{a.programCompleted}</span>
                      </div>
                    )}
                    {(a.city || a.state) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="size-3 shrink-0 text-gray-400" />
                        <span className="truncate">
                          {[a.city, a.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {a.engagementScore > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-400">Engagement</span>
                        <span className="admin-badge admin-badge-green" style={{ fontSize: "10px" }}>
                          {a.engagementScore} pts
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </LinkButton>
              <div className="px-4 pb-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleFeatured(a.id);
                  }}
                  className="text-xs text-gray-400 hover:text-amber-500 transition-colors"
                  title={a.isFeatured ? "Remove from featured" : "Mark as featured"}
                >
                  <Star className={`size-3.5 ${a.isFeatured ? "text-amber-500 fill-amber-500" : ""}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
