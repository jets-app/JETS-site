"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createJobPosting,
  closeJobPosting,
} from "@/server/actions/jobs.actions";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  Building2,
  DollarSign,
  X,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import type { JobPosting } from "@prisma/client";

interface JobStats {
  total: number;
  active: number;
  closed: number;
}

interface JobBoardDashboardProps {
  jobs: JobPosting[];
  total: number;
  stats: JobStats;
  selectedStatus: string | null;
  search: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  APPRENTICESHIP: "Apprenticeship",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  VOLUNTEER: "Volunteer",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "admin-badge admin-badge-green",
  CLOSED: "admin-badge admin-badge-gray",
  EXPIRED: "admin-badge admin-badge-red",
};

export function JobBoardDashboard({
  jobs,
  total,
  stats,
  selectedStatus,
  search: initialSearch,
}: JobBoardDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("FULL_TIME");
  const [trade, setTrade] = useState("");
  const [salary, setSalary] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedStatus) params.set("status", selectedStatus);
    startTransition(() => {
      router.push(`/admin/alumni/jobs?${params.toString()}`);
    });
  }

  function handleStatusFilter(status: string | null) {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (status) params.set("status", status);
    startTransition(() => {
      router.push(`/admin/alumni/jobs?${params.toString()}`);
    });
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createJobPosting({
        title,
        company,
        description,
        location: location || undefined,
        type: type as "FULL_TIME" | "PART_TIME" | "APPRENTICESHIP" | "INTERNSHIP" | "CONTRACT" | "VOLUNTEER",
        trade: trade || undefined,
        salary: salary || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        applyUrl: applyUrl || undefined,
      });
      setShowForm(false);
      resetForm();
    } catch {
      // handle error
    }
  }

  async function handleCloseJob(id: string) {
    try {
      await closeJobPosting(id);
    } catch {
      // handle error
    }
  }

  function resetForm() {
    setTitle("");
    setCompany("");
    setDescription("");
    setLocation("");
    setType("FULL_TIME");
    setTrade("");
    setSalary("");
    setContactEmail("");
    setContactPhone("");
    setApplyUrl("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Job Board</h1>
          <p className="admin-page-subtitle">
            Manage job postings for alumni and students
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="admin-btn-primary"
        >
          <Plus className="size-4" />
          Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-label">Total Jobs</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.active}</div>
          <div className="admin-stat-label">Active</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.closed}</div>
          <div className="admin-stat-label">Closed</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Job Posting</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Job Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className="admin-input" placeholder="e.g. HVAC Technician" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Company *</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} required className="admin-input" placeholder="e.g. ABC Heating & Cooling" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="admin-input" placeholder="e.g. Los Angeles, CA" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Job Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="admin-input">
                  {Object.entries(JOB_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Trade</label>
                <input value={trade} onChange={(e) => setTrade(e.target.value)} className="admin-input" placeholder="e.g. Electrical, Plumbing" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Salary</label>
                <input value={salary} onChange={(e) => setSalary(e.target.value)} className="admin-input" placeholder="e.g. $50,000 - $70,000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Contact Email</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="admin-input" type="email" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Contact Phone</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Apply URL</label>
              <input value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} className="admin-input" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="admin-input min-h-[120px]"
                placeholder="Describe the role, requirements, and qualifications..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="admin-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="admin-btn-primary">
                Create Job Posting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-2 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-9"
            />
          </div>
          <button type="submit" className="admin-btn-secondary" disabled={isPending}>
            Search
          </button>
        </form>
        <div className="flex gap-1.5">
          {["All", "ACTIVE", "CLOSED", "EXPIRED"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s === "All" ? null : s)}
              className={(s === "All" && !selectedStatus) || selectedStatus === s ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <Briefcase className="mx-auto size-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium text-gray-700">No job postings yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first job posting to help alumni and students find opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="admin-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={STATUS_STYLES[job.status] ?? "admin-badge admin-badge-gray"}>
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </span>
                    <span className="admin-badge admin-badge-blue">
                      {JOB_TYPE_LABELS[job.type] ?? job.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3.5" />
                      {job.company}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3.5" />
                        {job.salary}
                      </span>
                    )}
                    {job.trade && (
                      <span className="admin-badge admin-badge-burgundy">
                        {job.trade}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    {job.contactEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" />
                        {job.contactEmail}
                      </span>
                    )}
                    {job.contactPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" />
                        {job.contactPhone}
                      </span>
                    )}
                    {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#A30018] hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        Apply Link
                      </a>
                    )}
                  </div>
                </div>
                {job.status === "ACTIVE" && (
                  <button
                    onClick={() => handleCloseJob(job.id)}
                    className="admin-btn-secondary shrink-0"
                    style={{ fontSize: "12px", padding: "6px 10px" }}
                  >
                    Close Job
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
