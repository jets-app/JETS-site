"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAlumni, updateAlumni } from "@/server/actions/alumni.actions";
import type { Alumni } from "@prisma/client";

interface AlumniFormProps {
  alumni?: Alumni | null;
  onClose?: () => void;
}

export function AlumniForm({ alumni, onClose }: AlumniFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const data = {
      firstName: form.get("firstName") as string,
      lastName: form.get("lastName") as string,
      email: (form.get("email") as string) || undefined,
      phone: (form.get("phone") as string) || undefined,
      address: (form.get("address") as string) || undefined,
      graduationYear: parseInt(form.get("graduationYear") as string, 10),
      programCompleted: (form.get("programCompleted") as string) || undefined,
      photoUrl: (form.get("photoUrl") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    };

    if (!data.firstName || !data.lastName || !data.graduationYear) {
      setError("First name, last name, and graduation year are required.");
      setLoading(false);
      return;
    }

    try {
      if (alumni) {
        await updateAlumni(alumni.id, data);
      } else {
        await createAlumni(data);
      }
      router.refresh();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name *
          </label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={alumni?.firstName ?? ""}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name *
          </label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={alumni?.lastName ?? ""}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={alumni?.email ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            defaultValue={alumni?.phone ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="graduationYear" className="text-sm font-medium">
            Graduation Year *
          </label>
          <Input
            id="graduationYear"
            name="graduationYear"
            type="number"
            min={1990}
            max={2100}
            defaultValue={alumni?.graduationYear ?? new Date().getFullYear()}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="programCompleted" className="text-sm font-medium">
            Program Completed
          </label>
          <Input
            id="programCompleted"
            name="programCompleted"
            defaultValue={alumni?.programCompleted ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>
        <Input
          id="address"
          name="address"
          defaultValue={alumni?.address ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="photoUrl" className="text-sm font-medium">
          Photo URL
        </label>
        <Input
          id="photoUrl"
          name="photoUrl"
          type="url"
          defaultValue={alumni?.photoUrl ?? ""}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={alumni?.notes ?? ""}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : alumni ? "Update Alumni" : "Add Alumni"}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
