import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getDocumentTemplates } from "@/server/actions/document.actions";
import { DocumentTemplateList } from "../_components/document-template-list";

export default async function TemplatesListPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const templates = await getDocumentTemplates();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="admin-page-title">Document Templates</h1>
        <p className="admin-page-subtitle">
          Manage document templates for enrollment, medical forms, and contracts.
        </p>
      </div>

      <DocumentTemplateList
        templates={JSON.parse(JSON.stringify(templates))}
      />
    </div>
  );
}
