"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createDonor, updateDonor } from "@/server/actions/donor.actions";
import { X } from "lucide-react";
import type { Donor } from "@prisma/client";

interface DonorFormProps {
  donor?: Donor | null;
  onClose?: () => void;
}

export function DonorForm({ donor, onClose }: DonorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(donor?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

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
      city: (form.get("city") as string) || undefined,
      state: (form.get("state") as string) || undefined,
      zipCode: (form.get("zipCode") as string) || undefined,
      country: (form.get("country") as string) || undefined,
      tags,
      notes: (form.get("notes") as string) || undefined,
    };

    if (!data.firstName || !data.lastName) {
      setError("First name and last name are required.");
      setLoading(false);
      return;
    }

    try {
      if (donor) {
        await updateDonor(donor.id, data);
      } else {
        await createDonor(data);
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
            defaultValue={donor?.firstName ?? ""}
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
            defaultValue={donor?.lastName ?? ""}
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
            defaultValue={donor?.email ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            defaultValue={donor?.phone ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="address" className="text-sm font-medium">
          Street Address
        </label>
        <Input
          id="address"
          name="address"
          defaultValue={donor?.address ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <Input id="city" name="city" defaultValue={donor?.city ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="state" className="text-sm font-medium">
            State
          </label>
          <Input id="state" name="state" defaultValue={donor?.state ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="zipCode" className="text-sm font-medium">
            Zip
          </label>
          <Input
            id="zipCode"
            name="zipCode"
            defaultValue={donor?.zipCode ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="country" className="text-sm font-medium">
            Country
          </label>
          <Input
            id="country"
            name="country"
            defaultValue={donor?.country ?? "United States"}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={donor?.notes ?? ""}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : donor ? "Update Donor" : "Add Donor"}
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
