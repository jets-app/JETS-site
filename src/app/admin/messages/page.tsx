import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import {
  getInbox,
  getSentMessages,
  getMessageTemplates,
  getUnreadCount,
  getAcademicYears,
} from "@/server/actions/message.actions";
import { AdminMessagesClient } from "./_components/admin-messages-client";
import { CommsTabs } from "./_components/comms-tabs";

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const [inbox, sent, templates, unreadCount, academicYears] =
    await Promise.all([
      getInbox(session.user.id),
      getSentMessages(session.user.id),
      getMessageTemplates(),
      getUnreadCount(session.user.id),
      getAcademicYears(),
    ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send and manage messages to parents.
        </p>
      </div>

      <CommsTabs />

      <AdminMessagesClient
        initialInbox={JSON.parse(JSON.stringify(inbox))}
        initialSent={JSON.parse(JSON.stringify(sent))}
        initialTemplates={JSON.parse(JSON.stringify(templates))}
        unreadCount={unreadCount}
        academicYears={academicYears}
        userId={session.user.id}
      />
    </div>
  );
}
