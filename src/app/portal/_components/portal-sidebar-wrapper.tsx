import { db } from "@/server/db";
import { PortalSidebar } from "@/components/layout/portal-sidebar";

interface PortalSidebarWrapperProps {
  userId?: string;
}

export async function PortalSidebarWrapper({
  userId,
}: PortalSidebarWrapperProps) {
  let unreadCount = 0;
  let applicationStatus: string | null = null;

  if (userId) {
    try {
      const [msgCount, application] = await Promise.all([
        db.message.count({
          where: { receiverId: userId, isRead: false },
        }),
        db.application.findFirst({
          where: { parentId: userId },
          select: { status: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      unreadCount = msgCount;
      applicationStatus = application?.status ?? null;
    } catch {
      // Silently fail
    }
  }

  return (
    <PortalSidebar
      unreadCount={unreadCount}
      applicationStatus={applicationStatus}
    />
  );
}
