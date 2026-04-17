"use client";

import { useState } from "react";
import {
  createMentorProfile,
  requestMentor,
  updateMentorshipStatus,
} from "@/server/actions/mentorship.actions";
import {
  Users,
  Plus,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Handshake,
} from "lucide-react";
import type { Alumni, MentorProfile, MentorshipMatch } from "@prisma/client";

type MentorWithAlumni = MentorProfile & { alumni: Alumni };

interface MentorStats {
  totalMentors: number;
  availableMentors: number;
  totalMatches: number;
  activeMatches: number;
  pendingMatches: number;
}

interface MentorDashboardProps {
  mentors: MentorWithAlumni[];
  matches: MentorshipMatch[];
  stats: MentorStats;
  alumni: Alumni[];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "admin-badge admin-badge-yellow",
  ACTIVE: "admin-badge admin-badge-green",
  COMPLETED: "admin-badge admin-badge-blue",
  CANCELLED: "admin-badge admin-badge-gray",
};

export function MentorDashboard({
  mentors,
  matches,
  stats,
  alumni,
}: MentorDashboardProps) {
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [showRequestMentor, setShowRequestMentor] = useState<string | null>(null);

  // Create mentor form
  const [selectedAlumniId, setSelectedAlumniId] = useState("");
  const [trades, setTrades] = useState("");
  const [bio, setBio] = useState("");
  const [maxMentees, setMaxMentees] = useState(2);

  // Request mentor form
  const [menteeName, setMenteeName] = useState("");
  const [menteeEmail, setMenteeEmail] = useState("");
  const [menteePhone, setMenteePhone] = useState("");
  const [menteeTrade, setMenteeTrade] = useState("");
  const [menteeNotes, setMenteeNotes] = useState("");

  // Filter out alumni who already are mentors
  const mentorAlumniIds = new Set(mentors.map((m) => m.alumniId));
  const availableAlumni = alumni.filter((a) => !mentorAlumniIds.has(a.id));

  async function handleCreateMentor(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMentorProfile(selectedAlumniId, {
        trades: trades.split(",").map((t) => t.trim()).filter(Boolean),
        bio: bio || undefined,
        maxMentees,
      });
      setShowCreateMentor(false);
      setSelectedAlumniId("");
      setTrades("");
      setBio("");
      setMaxMentees(2);
    } catch {
      // handle error
    }
  }

  async function handleRequestMentor(e: React.FormEvent) {
    e.preventDefault();
    if (!showRequestMentor) return;
    try {
      await requestMentor(showRequestMentor, {
        menteeName,
        menteeEmail: menteeEmail || undefined,
        menteePhone: menteePhone || undefined,
        trade: menteeTrade || undefined,
        notes: menteeNotes || undefined,
      });
      setShowRequestMentor(null);
      setMenteeName("");
      setMenteeEmail("");
      setMenteePhone("");
      setMenteeTrade("");
      setMenteeNotes("");
    } catch {
      // handle error
    }
  }

  async function handleUpdateStatus(id: string, status: "ACTIVE" | "COMPLETED" | "CANCELLED") {
    try {
      await updateMentorshipStatus(id, status);
    } catch {
      // handle error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Mentorship Program</h1>
          <p className="admin-page-subtitle">
            Connect alumni mentors with current students
          </p>
        </div>
        <button
          onClick={() => setShowCreateMentor(!showCreateMentor)}
          className="admin-btn-primary"
        >
          <Plus className="size-4" />
          Add Mentor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.totalMentors}</div>
          <div className="admin-stat-label">Total Mentors</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.availableMentors}</div>
          <div className="admin-stat-label">Available</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.totalMatches}</div>
          <div className="admin-stat-label">Total Matches</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.activeMatches}</div>
          <div className="admin-stat-label">Active</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.pendingMatches}</div>
          <div className="admin-stat-label">Pending</div>
        </div>
      </div>

      {/* Create Mentor Form */}
      {showCreateMentor && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create Mentor Profile</h2>
            <button onClick={() => setShowCreateMentor(false)} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleCreateMentor} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Select Alumni *</label>
                <select
                  value={selectedAlumniId}
                  onChange={(e) => setSelectedAlumniId(e.target.value)}
                  required
                  className="admin-input"
                >
                  <option value="">Choose an alumni...</option>
                  {availableAlumni.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName} (Class of {a.graduationYear})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Trades (comma-separated) *</label>
                <input
                  value={trades}
                  onChange={(e) => setTrades(e.target.value)}
                  required
                  className="admin-input"
                  placeholder="e.g. Electrical, Plumbing, HVAC"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Max Mentees</label>
                <input
                  type="number"
                  value={maxMentees}
                  onChange={(e) => setMaxMentees(parseInt(e.target.value) || 2)}
                  min={1}
                  max={10}
                  className="admin-input"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="admin-input min-h-[80px]"
                placeholder="Brief description of experience and what they can offer..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateMentor(false)} className="admin-btn-secondary">Cancel</button>
              <button type="submit" className="admin-btn-primary">Create Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Mentors Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Mentors</h2>
        {mentors.length === 0 ? (
          <div className="admin-card p-12 text-center">
            <Users className="mx-auto size-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-700">No mentors yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first mentor profile from an existing alumni.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((m) => (
              <div key={m.id} className="admin-card p-4">
                <div className="flex items-start gap-3">
                  {m.alumni.photoUrl ? (
                    <img src={m.alumni.photoUrl} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-gray-500">
                        {m.alumni.firstName[0]}{m.alumni.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">
                      {m.alumni.firstName} {m.alumni.lastName}
                    </p>
                    <p className="text-xs text-gray-400">Class of {m.alumni.graduationYear}</p>
                  </div>
                  <span className={m.isAvailable ? "admin-badge admin-badge-green" : "admin-badge admin-badge-gray"}>
                    {m.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                {m.trades.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {m.trades.map((t) => (
                      <span key={t} className="admin-badge admin-badge-burgundy">{t}</span>
                    ))}
                  </div>
                )}
                {m.bio && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{m.bio}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Max {m.maxMentees} mentees
                  </span>
                  <button
                    onClick={() => setShowRequestMentor(m.id)}
                    className="admin-btn-secondary"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    <Handshake className="size-3" />
                    Assign Mentee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Mentor Modal */}
      {showRequestMentor && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assign Mentee</h2>
            <button onClick={() => setShowRequestMentor(null)} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleRequestMentor} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mentee Name *</label>
                <input value={menteeName} onChange={(e) => setMenteeName(e.target.value)} required className="admin-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mentee Email</label>
                <input value={menteeEmail} onChange={(e) => setMenteeEmail(e.target.value)} className="admin-input" type="email" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mentee Phone</label>
                <input value={menteePhone} onChange={(e) => setMenteePhone(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Trade</label>
                <input value={menteeTrade} onChange={(e) => setMenteeTrade(e.target.value)} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
              <textarea value={menteeNotes} onChange={(e) => setMenteeNotes(e.target.value)} className="admin-input min-h-[60px]" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowRequestMentor(null)} className="admin-btn-secondary">Cancel</button>
              <button type="submit" className="admin-btn-primary">Create Match</button>
            </div>
          </form>
        </div>
      )}

      {/* Matches */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Mentorship Matches</h2>
        {matches.length === 0 ? (
          <div className="admin-card p-8 text-center">
            <Handshake className="mx-auto size-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No mentorship matches yet</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table>
              <thead>
                <tr>
                  <th>Mentee</th>
                  <th>Contact</th>
                  <th>Trade</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const mentor = mentors.find((m) => m.alumniId === match.mentorId);
                  return (
                    <tr key={match.id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{match.menteeName}</p>
                          {mentor && (
                            <p className="text-xs text-gray-400">
                              Mentor: {mentor.alumni.firstName} {mentor.alumni.lastName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-gray-500">
                        {match.menteeEmail && <div>{match.menteeEmail}</div>}
                        {match.menteePhone && <div>{match.menteePhone}</div>}
                      </td>
                      <td>{match.trade ?? "-"}</td>
                      <td>
                        <span className={STATUS_STYLES[match.status] ?? "admin-badge admin-badge-gray"}>
                          {match.status.charAt(0) + match.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="text-xs text-gray-400">
                        {match.startedAt ? new Date(match.startedAt).toLocaleDateString() : "-"}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {match.status === "PENDING" && (
                            <button
                              onClick={() => handleUpdateStatus(match.id, "ACTIVE")}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle2 className="size-4" />
                            </button>
                          )}
                          {match.status === "ACTIVE" && (
                            <button
                              onClick={() => handleUpdateStatus(match.id, "COMPLETED")}
                              className="text-blue-600 hover:text-blue-800"
                              title="Complete"
                            >
                              <UserCheck className="size-4" />
                            </button>
                          )}
                          {(match.status === "PENDING" || match.status === "ACTIVE") && (
                            <button
                              onClick={() => handleUpdateStatus(match.id, "CANCELLED")}
                              className="text-gray-400 hover:text-red-600"
                              title="Cancel"
                            >
                              <XCircle className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
