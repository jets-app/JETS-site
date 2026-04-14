import { db } from "@/server/db";
import { PortalSidebar } from "@/components/layout/portal-sidebar";

interface PortalSidebarWrapperProps {
  userId?: string;
}

export async function PortalSidebarWrapper({
  userId,
}: PortalSidebarWrapperProps) {
  let unreadCount = 0;

  if (userId) {
    try {
      unreadCount = await db.message.count({
        where: { receiverId: userId, isRead: false },
      });
    } catch {
      // Silently fail — sidebar still renders without badge
    }
  }

  return <PortalSidebar unreadCount={unreadCount} />;
}
