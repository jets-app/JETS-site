"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAlumniEvent,
  updateAlumniEvent,
  rsvpToEvent,
  deleteAlumniEvent,
} from "@/server/actions/alumni-events.actions";
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
} from "lucide-react";
import type { AlumniEvent, EventRsvp } from "@prisma/client";

type EventWithRsvps = AlumniEvent & { rsvps: EventRsvp[] };

interface EventStats {
  total: number;
  upcoming: number;
  published: number;
  totalRsvps: number;
}

interface EventsDashboardProps {
  events: EventWithRsvps[];
  total: number;
  stats: EventStats;
  selectedStatus: string | null;
  search: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "admin-badge admin-badge-gray",
  PUBLISHED: "admin-badge admin-badge-green",
  CANCELLED: "admin-badge admin-badge-red",
  COMPLETED: "admin-badge admin-badge-blue",
};

const RSVP_STYLES: Record<string, string> = {
  INVITED: "admin-badge admin-badge-gray",
  ATTENDING: "admin-badge admin-badge-green",
  DECLINED: "admin-badge admin-badge-red",
  MAYBE: "admin-badge admin-badge-yellow",
};

export function EventsDashboard({
  events,
  total,
  stats,
  selectedStatus,
  search: initialSearch,
}: EventsDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showRsvpForm, setShowRsvpForm] = useState<string | null>(null);

  // Event form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventStatus, setEventStatus] = useState("DRAFT");
  const [maxAttendees, setMaxAttendees] = useState("");

  // RSVP form state
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("ATTENDING");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedStatus) params.set("status", selectedStatus);
    startTransition(() => {
      router.push(`/admin/alumni/events?${params.toString()}`);
    });
  }

  function handleStatusFilter(status: string | null) {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (status) params.set("status", status);
    startTransition(() => {
      router.push(`/admin/alumni/events?${params.toString()}`);
    });
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAlumniEvent({
        title,
        description: description || undefined,
        location: location || undefined,
        date,
        endDate: endDate || undefined,
        status: eventStatus as "DRAFT" | "PUBLISHED",
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      });
      setShowForm(false);
      resetForm();
    } catch {
      // handle error
    }
  }

  async function handlePublish(id: string) {
    try {
      await updateAlumniEvent(id, { status: "PUBLISHED" });
    } catch {
      // handle error
    }
  }

  async function handleCancel(id: string) {
    try {
      await updateAlumniEvent(id, { status: "CANCELLED" });
    } catch {
      // handle error
    }
  }

  async function handleComplete(id: string) {
    try {
      await updateAlumniEvent(id, { status: "COMPLETED" });
    } catch {
      // handle error
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteAlumniEvent(id);
    } catch {
      // handle error
    }
  }

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!showRsvpForm) return;
    try {
      await rsvpToEvent(showRsvpForm, {
        name: rsvpName,
        email: rsvpEmail || undefined,
        status: rsvpStatus as "INVITED" | "ATTENDING" | "DECLINED" | "MAYBE",
      });
      setShowRsvpForm(null);
      setRsvpName("");
      setRsvpEmail("");
      setRsvpStatus("ATTENDING");
    } catch {
      // handle error
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setEndDate("");
    setEventStatus("DRAFT");
    setMaxAttendees("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Alumni Events</h1>
          <p className="admin-page-subtitle">
            Create events, manage RSVPs, and track attendance
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="admin-btn-primary"
        >
          <Plus className="size-4" />
          Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-label">Total Events</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.upcoming}</div>
          <div className="admin-stat-label">Upcoming</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.published}</div>
          <div className="admin-stat-label">Published</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.totalRsvps}</div>
          <div className="admin-stat-label">Total Attending</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Event</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Event Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className="admin-input" placeholder="e.g. Annual Alumni Reunion" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date & Time *</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="admin-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">End Date & Time</label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="admin-input" placeholder="e.g. JETS Campus, Main Hall" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Max Attendees</label>
                <input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} className="admin-input" min="1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)} className="admin-input">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="admin-input min-h-[100px]"
                placeholder="Event details, agenda, what to bring..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="admin-btn-secondary">Cancel</button>
              <button type="submit" className="admin-btn-primary">Create Event</button>
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
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-9"
            />
          </div>
          <button type="submit" className="admin-btn-secondary" disabled={isPending}>Search</button>
        </form>
        <div className="flex gap-1.5">
          {["All", "DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"].map((s) => (
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

      {/* Events List */}
      {events.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <Calendar className="mx-auto size-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium text-gray-700">No events yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first alumni event to start building community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const attending = event.rsvps.filter((r) => r.status === "ATTENDING").length;
            const declined = event.rsvps.filter((r) => r.status === "DECLINED").length;
            const maybe = event.rsvps.filter((r) => r.status === "MAYBE").length;

            return (
              <div key={event.id} className="admin-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className={STATUS_STYLES[event.status] ?? "admin-badge admin-badge-gray"}>
                          {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {attending} attending
                          {event.maxAttendees ? ` / ${event.maxAttendees} max` : ""}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {event.status === "DRAFT" && (
                        <button onClick={() => handlePublish(event.id)} className="admin-btn-primary" style={{ fontSize: "12px", padding: "6px 10px" }}>
                          Publish
                        </button>
                      )}
                      {event.status === "PUBLISHED" && (
                        <button onClick={() => handleComplete(event.id)} className="admin-btn-secondary" style={{ fontSize: "12px", padding: "6px 10px" }}>
                          Complete
                        </button>
                      )}
                      {(event.status === "DRAFT" || event.status === "PUBLISHED") && (
                        <button onClick={() => handleCancel(event.id)} className="admin-btn-ghost" style={{ fontSize: "12px", padding: "6px 10px" }}>
                          Cancel
                        </button>
                      )}
                      <button onClick={() => handleDelete(event.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: RSVPs */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="admin-badge admin-badge-green">{attending} Attending</span>
                        <span className="admin-badge admin-badge-yellow">{maybe} Maybe</span>
                        <span className="admin-badge admin-badge-red">{declined} Declined</span>
                        <span className="admin-badge admin-badge-gray">{event.rsvps.filter((r) => r.status === "INVITED").length} Invited</span>
                      </div>
                      <button
                        onClick={() => setShowRsvpForm(showRsvpForm === event.id ? null : event.id)}
                        className="admin-btn-secondary"
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        <UserPlus className="size-3" />
                        Add RSVP
                      </button>
                    </div>

                    {showRsvpForm === event.id && (
                      <form onSubmit={handleRsvp} className="admin-card p-4 mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} required className="admin-input" placeholder="Name *" />
                          <input value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} className="admin-input" placeholder="Email" type="email" />
                          <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)} className="admin-input">
                            <option value="ATTENDING">Attending</option>
                            <option value="MAYBE">Maybe</option>
                            <option value="DECLINED">Declined</option>
                            <option value="INVITED">Invited</option>
                          </select>
                          <button type="submit" className="admin-btn-primary">Add</button>
                        </div>
                      </form>
                    )}

                    {event.rsvps.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No RSVPs yet</p>
                    ) : (
                      <div className="space-y-1">
                        {event.rsvps.map((rsvp) => (
                          <div key={rsvp.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white">
                            <div className="flex items-center gap-3">
                              <div className="size-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-gray-500">
                                  {rsvp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{rsvp.name}</p>
                                {rsvp.email && <p className="text-xs text-gray-400">{rsvp.email}</p>}
                              </div>
                            </div>
                            <span className={RSVP_STYLES[rsvp.status] ?? "admin-badge admin-badge-gray"}>
                              {rsvp.status.charAt(0) + rsvp.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
