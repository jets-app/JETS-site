"use client";

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  User as UserIcon,
  Mail,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  updateProfile,
  changePassword,
  signOutAllSessions,
} from "@/server/actions/profile.actions";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

function Alert({ feedback }: { feedback: Feedback }) {
  const isSuccess = feedback.type === "success";
  return (
    <div
      className={
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm " +
        (isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-destructive/30 bg-destructive/10 text-destructive")
      }
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      )}
      <span>{feedback.message}</span>
    </div>
  );
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  // ---------- Profile section state ----------
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileFeedback, setProfileFeedback] = useState<Feedback | null>(null);
  const [isSavingProfile, startProfileTransition] = useTransition();

  // ---------- Email section state ----------
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailFeedback, setEmailFeedback] = useState<Feedback | null>(null);
  const [isSavingEmail, startEmailTransition] = useTransition();

  // ---------- Password section state ----------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(
    null,
  );
  const [isSavingPassword, startPasswordTransition] = useTransition();

  // ---------- Avatar handlers ----------
  const handleAvatarSelect = (file: File | null) => {
    setAvatarError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.onerror = () => setAvatarError("Failed to read image.");
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------- Submit handlers ----------
  const handleSaveProfile = () => {
    setProfileFeedback(null);
    startProfileTransition(async () => {
      const res = await updateProfile({
        name,
        phone,
        avatarUrl: avatarUrl ?? "",
      });
      if (res?.error) {
        setProfileFeedback({ type: "error", message: res.error });
      } else {
        setProfileFeedback({
          type: "success",
          message: "Profile updated successfully.",
        });
      }
    });
  };

  const handleSaveEmail = () => {
    setEmailFeedback(null);
    startEmailTransition(async () => {
      const { requestEmailChange } = await import(
        "@/server/actions/email-change.actions"
      );
      const res = await requestEmailChange({
        newEmail,
        currentPassword: emailPassword,
      });
      if (res?.error) {
        setEmailFeedback({ type: "error", message: res.error });
      } else {
        setEmailFeedback({
          type: "success",
          message:
            res.message ??
            `Confirmation sent to ${newEmail}. Click the link there to finalize. We've also notified your current email so you can revert if this wasn't you.`,
        });
        setNewEmail("");
        setEmailPassword("");
      }
    });
  };

  const handleChangePassword = () => {
    setPasswordFeedback(null);
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }
    startPasswordTransition(async () => {
      const res = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );
      if (res?.error) {
        setPasswordFeedback({ type: "error", message: res.error });
      } else {
        setPasswordFeedback({
          type: "success",
          message: "Password changed successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = format(new Date(user.createdAt), "MMMM d, yyyy");

  return (
    <div className="space-y-6">
      {/* ============ Account Info ============ */}
      <section className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Account Information</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium break-all">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="font-medium">{memberSince}</p>
          </div>
        </div>
      </section>

      {/* ============ Profile Details ============ */}
      <section className="rounded-xl border bg-card p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Profile Details</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={user.name} />
            ) : null}
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleAvatarSelect(e.target.files?.[0] ?? null)
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSavingProfile}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Photo
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isSavingProfile}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 5MB.
            </p>
            {avatarError && (
              <p className="text-xs text-destructive">{avatarError}</p>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSavingProfile}
            placeholder="Your full name"
          />
        </div>

        {/* Email (readonly) */}
        <div className="space-y-1.5">
          <Label htmlFor="email-readonly">Email</Label>
          <Input
            id="email-readonly"
            value={user.email}
            readOnly
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            To change your email, use the Change Email section below.
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSavingProfile}
            placeholder="(555) 123-4567"
          />
        </div>

        {profileFeedback && <Alert feedback={profileFeedback} />}

        <div className="flex justify-end">
          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile || !name.trim()}
          >
            {isSavingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save Changes
          </Button>
        </div>
      </section>

      {/* ============ Change Email ============ */}
      <section className="rounded-xl border bg-card p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Change Email</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter a new email address and confirm with your current password.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-email">New Email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={isSavingEmail}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-current-password">Current Password</Label>
            <Input
              id="email-current-password"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              disabled={isSavingEmail}
              placeholder="••••••••"
            />
          </div>
        </div>

        {emailFeedback && <Alert feedback={emailFeedback} />}

        <div className="flex justify-end">
          <Button
            onClick={handleSaveEmail}
            disabled={isSavingEmail || !newEmail.trim() || !emailPassword}
          >
            {isSavingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Mail className="h-4 w-4 mr-1.5" />
            )}
            Update Email
          </Button>
        </div>
      </section>

      {/* ============ Change Password ============ */}
      <section className="rounded-xl border bg-card p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Change Password</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Use at least 8 characters with one uppercase letter and one number.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isSavingPassword}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSavingPassword}
              />
            </div>
          </div>
        </div>

        {passwordFeedback && <Alert feedback={passwordFeedback} />}

        <div className="flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={
              isSavingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
          >
            {isSavingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Lock className="h-4 w-4 mr-1.5" />
            )}
            Change Password
          </Button>
        </div>
      </section>

      {/* ---------- Sign out everywhere ---------- */}
      <section className="border-t pt-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sign out everywhere
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Sign yourself out on every browser and device. Use this if you
              think someone else might have access to your account.
            </p>
          </div>
          <SignOutAllButton />
        </div>
      </section>
    </div>
  );
}

function SignOutAllButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (
          !confirm(
            "Sign out on every device? You'll need to sign in again on each one.",
          )
        ) {
          return;
        }
        startTransition(async () => {
          await signOutAllSessions();
        });
      }}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
      ) : (
        <Shield className="h-4 w-4 mr-1.5" />
      )}
      Sign out everywhere
    </Button>
  );
}
