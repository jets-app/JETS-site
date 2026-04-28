"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createStaff,
  resendPasswordSetup,
  updateStaff,
  deleteStaff,
} from "@/server/actions/staff.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Mail, CheckCircle2, Pencil, Trash2, X, Save } from "lucide-react";

type Staff = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
};

const ROLES = [
  { value: "PRINCIPAL", label: "Principal" },
  { value: "SECRETARY", label: "Secretary (office staff)" },
  { value: "REVIEWER", label: "Reviewer (read + comment)" },
  { value: "ADMIN", label: "Admin (full control)" },
];

export function StaffManager({
  initialStaff,
  currentUserId,
}: {
  initialStaff: Staff[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("PRINCIPAL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("PRINCIPAL");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function startEdit(s: Staff) {
    setEditingId(s.id);
    setEditName(s.name);
    setEditEmail(s.email);
    setEditRole(s.role);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(userId: string) {
    setBusyId(userId);
    setMessage(null);
    const result = await updateStaff({
      userId,
      name: editName,
      email: editEmail,
      role: editRole as "ADMIN" | "PRINCIPAL" | "SECRETARY" | "REVIEWER",
    });
    setBusyId(null);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setEditingId(null);
    setMessage({ type: "success", text: "Account updated." });
    router.refresh();
  }

  async function handleDelete(s: Staff) {
    if (
      !confirm(
        `Remove ${s.name} (${s.email}) from staff? They'll lose access immediately.`,
      )
    ) {
      return;
    }
    setBusyId(s.id);
    setMessage(null);
    const result = await deleteStaff(s.id);
    setBusyId(null);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({
      type: "success",
      text:
        result.mode === "deleted"
          ? `${s.email} deleted.`
          : `${s.email} deactivated (kept for audit history).`,
    });
    router.refresh();
  }

  function handleCreate() {
    if (!name.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Name and email are required." });
      return;
    }
    setMessage(null);
    startCreating(async () => {
      const result = await createStaff({ name, email, role: role as "ADMIN" | "PRINCIPAL" | "REVIEWER" });
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      const action = result.isNewAccount ? "created" : "updated to " + role;
      const emailNote = result.emailDelivered
        ? "Setup email sent."
        : `Account ${action}, but email delivery failed: ${result.emailError ?? "unknown"}`;
      setMessage({
        type: result.emailDelivered ? "success" : "error",
        text: `${email} ${action}. ${emailNote}`,
      });
      setName("");
      setEmail("");
      setRole("PRINCIPAL");
      router.refresh();
    });
  }

  async function handleResend(userId: string, email: string) {
    setResendingId(userId);
    setMessage(null);
    const result = await resendPasswordSetup(userId);
    setResendingId(null);
    if (result.error) {
      setMessage({ type: "error", text: `Resend failed for ${email}: ${result.error}` });
    } else {
      setMessage({ type: "success", text: `Setup email resent to ${email}.` });
    }
  }

  return (
    <div className="space-y-8">
      {/* Add staff form */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add a staff member
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Rabbi Sufrin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="rabbisufrin@jetsschool.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isCreating}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Create + Email Setup Link
            </>
          )}
        </Button>
        {message && (
          <div
            className={`text-sm rounded-lg border p-3 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {message.type === "success" && (
              <CheckCircle2 className="inline h-4 w-4 mr-1" />
            )}
            {message.text}
          </div>
        )}
      </div>

      {/* Existing staff list */}
      <div className="bg-card border rounded-xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Current staff ({initialStaff.length})</h2>
        </div>
        {initialStaff.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground text-center">
            No staff accounts yet. Add one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium">Created</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialStaff.map((s) => {
                const isEditing = editingId === s.id;
                const isMe = s.id === currentUserId;
                const isBusy = busyId === s.id;
                return (
                  <tr key={s.id} className="border-b last:border-0 align-top">
                    <td className="px-6 py-3 font-medium">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isBusy}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <>
                          {s.name}
                          {isMe && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          disabled={isBusy}
                          className="h-8 text-sm"
                        />
                      ) : (
                        s.email
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          disabled={isBusy || isMe}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
                          {s.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {isEditing ? (
                        <div className="inline-flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={cancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleSaveEdit(s.id)}
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5 mr-1" /> Save
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex gap-1">
                          {!isMe && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={resendingId === s.id || isBusy}
                              onClick={() => handleResend(s.id, s.email)}
                              title="Resend password setup email"
                            >
                              {resendingId === s.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Mail className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => startEdit(s)}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {!isMe && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleDelete(s)}
                              className="text-destructive hover:bg-destructive/10"
                              title="Remove from staff"
                            >
                              {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
