"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, Save, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import {
  createDocumentTemplate,
  updateDocumentTemplate,
} from "@/server/actions/document.actions";

const TEMPLATE_TYPES = [
  { value: "MEDICAL_FORM", label: "Medical Form" },
  { value: "STUDENT_HANDBOOK", label: "Student Handbook" },
  { value: "TUITION_CONTRACT", label: "Tuition Contract" },
  { value: "ENROLLMENT_AGREEMENT", label: "Enrollment Agreement" },
  { value: "SCHOLARSHIP_CONTRACT", label: "Scholarship Contract" },
  { value: "PHOTO_RELEASE", label: "Photo Release" },
  { value: "CUSTOM", label: "Custom" },
];

const FIELD_TYPES = ["text", "date", "signature", "initials", "textarea", "tel", "email", "select"];

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface TemplateData {
  id: string;
  name: string;
  type: string;
  htmlContent: string | null;
  content: { fields?: Array<{ name: string; label: string; type: string; required: boolean }> } | null;
  isActive: boolean;
  version: number;
}

interface DocumentTemplateEditorProps {
  template: TemplateData | null;
}

export function DocumentTemplateEditor({
  template,
}: DocumentTemplateEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);

  const [name, setName] = useState(template?.name ?? "");
  const [type, setType] = useState(template?.type ?? "CUSTOM");
  const [htmlContent, setHtmlContent] = useState(
    template?.htmlContent ?? ""
  );
  const [fields, setFields] = useState<TemplateField[]>(
    template?.content?.fields ?? []
  );

  const isNew = template === null;

  const addField = () => {
    setFields([...fields, { name: "", label: "", type: "text", required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateFieldProp = (index: number, prop: keyof TemplateField, value: string | boolean) => {
    setFields(fields.map((f, i) => i === index ? { ...f, [prop]: value } : f));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Template name is required.");
      return;
    }

    if (!htmlContent.trim()) {
      alert("Template content is required.");
      return;
    }

    startTransition(async () => {
      try {
        if (isNew) {
          await createDocumentTemplate({
            name: name.trim(),
            type: type as any,
            htmlContent: htmlContent,
            fields: fields.filter((f) => f.name.trim()) as unknown as Record<string, unknown>[],
          });
        } else {
          await updateDocumentTemplate(template.id, {
            name: name.trim(),
            type: type as any,
            htmlContent: htmlContent,
            fields: fields.filter((f) => f.name.trim()) as unknown as Record<string, unknown>[],
          });
        }
        router.push("/admin/documents");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save template";
        alert(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LinkButton
          href="/admin/documents"
          variant="ghost"
          size="icon-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isNew ? "Create Template" : `Edit: ${template.name}`}
          </h1>
          {!isNew && (
            <p className="text-sm text-muted-foreground">
              Version {template.version} &middot;{" "}
              {template.isActive ? "Active" : "Inactive"}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Medical Form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">
                HTML Content
              </Label>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <EyeOff className="h-3 w-3 mr-1" />
                ) : (
                  <Eye className="h-3 w-3 mr-1" />
                )}
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Available variables: {"{{studentName}}"}, {"{{parentName}}"},{" "}
              {"{{dateOfBirth}}"}, {"{{academicYear}}"}, {"{{date}}"},{" "}
              {"{{tuitionAmount}}"}, {"{{scholarshipAmount}}"}
            </p>

            {showPreview ? (
              <div className="rounded-lg border bg-white p-6 min-h-[400px]">
                <div
                  dangerouslySetInnerHTML={{
                    __html: htmlContent
                      .replace(/\{\{studentName\}\}/g, "John Doe")
                      .replace(/\{\{parentName\}\}/g, "Jane Doe")
                      .replace(/\{\{dateOfBirth\}\}/g, "01/15/2010")
                      .replace(/\{\{academicYear\}\}/g, "2026-2027")
                      .replace(
                        /\{\{date\}\}/g,
                        new Date().toLocaleDateString()
                      )
                      .replace(/\{\{tuitionAmount\}\}/g, "$15,000")
                      .replace(/\{\{scholarshipAmount\}\}/g, "$5,000"),
                  }}
                />
              </div>
            ) : (
              <Textarea
                id="content"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Enter HTML content for the document..."
                className="min-h-[400px] font-mono text-xs"
              />
            )}
          </div>
          {/* Fields Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Template Fields</Label>
              <Button variant="outline" size="xs" onClick={addField} type="button">
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No fields defined. Fields are form inputs the signer fills in (e.g. allergies, insurance info).
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center rounded-lg border p-2"
                  >
                    <Input
                      placeholder="Field name (e.g. allergies)"
                      value={field.name}
                      onChange={(e) => updateFieldProp(i, "name", e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Label (e.g. Known Allergies)"
                      value={field.label}
                      onChange={(e) => updateFieldProp(i, "label", e.target.value)}
                      className="text-xs"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateFieldProp(i, "type", e.target.value)}
                      className="h-8 rounded-lg border border-input bg-transparent px-2 py-1 text-xs outline-none"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateFieldProp(i, "required", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300"
                      />
                      Req
                    </label>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeField(i)}
                      type="button"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placeholder Reference */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Available Placeholders
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {[
                { placeholder: "{{studentName}}", desc: "Student full name" },
                { placeholder: "{{parentName}}", desc: "Parent/guardian name" },
                { placeholder: "{{dateOfBirth}}", desc: "Student date of birth" },
                { placeholder: "{{academicYear}}", desc: "Academic year (e.g. 2026-2027)" },
                { placeholder: "{{date}}", desc: "Current date" },
                { placeholder: "{{tuitionAmount}}", desc: "Tuition amount" },
                { placeholder: "{{scholarshipAmount}}", desc: "Scholarship amount" },
              ].map((p) => (
                <div key={p.placeholder} className="flex flex-col">
                  <code className="font-mono text-primary font-medium">{p.placeholder}</code>
                  <span className="text-muted-foreground">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 w-full justify-end">
            <LinkButton
              href="/admin/documents"
              variant="outline"
              size="sm"
            >
              Cancel
            </LinkButton>
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleSave}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isNew ? "Create Template" : "Save Changes"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
