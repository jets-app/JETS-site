import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { createApplication } from "@/server/actions/application.actions";

export default async function NewApplicationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await createApplication();

  if (result.error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-destructive text-xl">!</span>
        </div>
        <h1 className="text-2xl font-bold">Unable to Create Application</h1>
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  redirect(`/portal/applications/${result.applicationId}/edit`);
}
