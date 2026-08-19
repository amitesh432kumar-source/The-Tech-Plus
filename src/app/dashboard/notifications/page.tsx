import type { Metadata } from "next";
import { Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { listMyNotifications } from "@/services/notifications";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/features/notifications/actions";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await listMyNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates about your courses, webinars, and orders.
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <BellOff className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${
                n.isRead ? "border-border bg-card" : "border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {!n.isRead && (
                  <form action={markNotificationReadAction.bind(null, n.id)}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      render={<button type="submit" />}
                    >
                      Mark read
                    </Badge>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
