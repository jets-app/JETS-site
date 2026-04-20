import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getInbox,
  getUnreadCount,
  getConversationWithAdmin,
} from "@/server/actions/message.actions";
import { PortalMessagesClient } from "./_components/portal-messages-client";

export default async function PortalMessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [inbox, unreadCount, conversation] = await Promise.all([
    getInbox(session.user.id),
    getUnreadCount(session.user.id),
    getConversationWithAdmin(session.user.id),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chat with the JETS admin office.
        </p>
      </div>

      <PortalMessagesClient
        initialInbox={JSON.parse(JSON.stringify(inbox))}
        unreadCount={unreadCount}
        userId={session.user.id}
        initialConversation={JSON.parse(JSON.stringify(conversation))}
      />
    </div>
  );
}
