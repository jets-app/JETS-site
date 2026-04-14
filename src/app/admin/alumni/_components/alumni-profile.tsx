"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import { AlumniForm } from "./alumni-form";
import { deleteAlumni } from "@/server/actions/alumni.actions";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
} from "lucide-react";
import type { Alumni, Student, Application } from "@prisma/client";

type AlumniWithRelations = Alumni & {
  student:
    | (Student & {
        application: { id: string; referenceNumber: string };
      })
    | null;
};

interface AlumniProfileProps {
  alumni: AlumniWithRelations;
}

export function AlumniProfile({ alumni }: AlumniProfileProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      await deleteAlumni(alumni.id);
      router.push("/admin/alumni");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LinkButton href="/admin/alumni" variant="ghost" size="sm">
        <ArrowLeft className="size-4 mr-1" />
        Back to Alumni
      </LinkButton>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {alumni.photoUrl ? (
          <img
            src={alumni.photoUrl}
            alt={`${alumni.firstName} ${alumni.lastName}`}
            className="size-20 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-20 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="size-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {alumni.firstName} {alumni.lastName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              <GraduationCap className="size-3 mr-1" />
              Class of {alumni.graduationYear}
            </Badge>
            {alumni.programCompleted && (
              <Badge variant="outline">{alumni.programCompleted}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            <Pencil className="size-4 mr-1" />
            Edit
          </Button>
          {!confirming ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-4 mr-1" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Confirm"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            <AlumniForm
              alumni={alumni}
              onClose={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alumni.email ? (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <a
                  href={`mailto:${alumni.email}`}
                  className="text-primary hover:underline"
                >
                  {alumni.email}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                No email on file
              </div>
            )}

            {alumni.phone ? (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                {alumni.phone}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                No phone on file
              </div>
            )}

            {alumni.address ? (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground shrink-0" />
                {alumni.address}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                No address on file
              </div>
            )}
          </CardContent>
        </Card>

        {/* Linked Application */}
        <Card>
          <CardHeader>
            <CardTitle>Student Record</CardTitle>
          </CardHeader>
          <CardContent>
            {alumni.student ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Linked to student record from application{" "}
                  <span className="font-mono font-medium">
                    {alumni.student.application.referenceNumber}
                  </span>
                </p>
                <LinkButton
                  href={`/admin/applications/${alumni.student.application.id}`}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="size-4 mr-1" />
                  View Application
                </LinkButton>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No linked student record. This alumni was added manually.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {alumni.notes ? (
            <p className="text-sm whitespace-pre-wrap">{alumni.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
