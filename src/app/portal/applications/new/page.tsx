import { redirect } from "next/navigation";
import { hasReapplyIntent } from "@/lib/reapply-intent";
import { NewApplicationForm } from "./_components/new-application-form";

export default async function NewApplicationPage() {
  // Parent landed here but originally came through /reapply — send them to
  // the returning-student form instead of letting them start a fresh app.
  if (await hasReapplyIntent()) {
    redirect("/portal/reapply");
  }

  return <NewApplicationForm />;
}
