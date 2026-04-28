import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";
import { getDocumentTemplate } from "@/server/actions/document.actions";
import { DocumentTemplateEditor } from "../../_components/document-template-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Handle "new" as a create flow
  if (id === "new") {
    return (
      <div className="max-w-4xl mx-auto">
        <DocumentTemplateEditor template={null} />
      </div>
    );
  }

  let template;
  try {
    template = await getDocumentTemplate(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <DocumentTemplateEditor
        template={JSON.parse(JSON.stringify(template))}
      />
    </div>
  );
}
