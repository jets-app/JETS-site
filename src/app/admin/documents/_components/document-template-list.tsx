"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  FileText,
  Loader2,
  Sprout,
} from "lucide-react";
import {
  updateDocumentTemplate,
  seedDefaultTemplates,
} from "@/server/actions/document.actions";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  MEDICAL_FORM: "Medical Form",
  STUDENT_HANDBOOK: "Student Handbook",
  TUITION_CONTRACT: "Tuition Contract",
  ENROLLMENT_AGREEMENT: "Enrollment Agreement",
  SCHOLARSHIP_CONTRACT: "Scholarship Contract",
  PHOTO_RELEASE: "Photo Release",
  CUSTOM: "Custom",
};

interface Template {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  _count: { documents: number };
}

interface DocumentTemplateListProps {
  templates: Template[];
}

export function DocumentTemplateList({
  templates,
}: DocumentTemplateListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleToggleActive = (id: string, currentActive: boolean) => {
    setTogglingId(id);
    startTransition(async () => {
      try {
        await updateDocumentTemplate(id, { isActive: !currentActive });
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update template";
        alert(message);
      } finally {
        setTogglingId(null);
      }
    });
  };

  const handleSeed = () => {
    if (
      !confirm(
        "This will create the 5 default document templates (Medical Form, Student Handbook, Tuition Contract, Enrollment Agreement, Scholarship Contract). Continue?"
      )
    ) {
      return;
    }

    setIsSeeding(true);
    startTransition(async () => {
      try {
        const result = await seedDefaultTemplates();
        if (result.seeded > 0) {
          router.refresh();
        } else {
          alert(result.message);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to seed templates";
        alert(message);
      } finally {
        setIsSeeding(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Templates
          </CardTitle>
          <div className="flex items-center gap-2">
            {templates.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeed}
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sprout className="h-3.5 w-3.5 mr-1.5" />
                )}
                Seed Defaults
              </Button>
            )}
            <LinkButton
              href="/admin/documents/templates/new"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Template
            </LinkButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {templates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No document templates yet</p>
            <p className="text-sm mt-1">
              Click &ldquo;Seed Defaults&rdquo; to create the standard enrollment templates, or create a custom one.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Documents Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <span className="font-medium">{template.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {TYPE_LABELS[template.type] ?? template.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent font-medium",
                        template.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      )}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      v{template.version}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{template._count.documents}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <LinkButton
                        href={`/admin/documents/templates/${template.id}`}
                        variant="ghost"
                        size="icon-xs"
                        title="Edit template"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </LinkButton>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={
                          isPending && togglingId === template.id
                        }
                        onClick={() =>
                          handleToggleActive(template.id, template.isActive)
                        }
                        title={
                          template.isActive
                            ? "Deactivate template"
                            : "Activate template"
                        }
                      >
                        {template.isActive ? (
                          <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
