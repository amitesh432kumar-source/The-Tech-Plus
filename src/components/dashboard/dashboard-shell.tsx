import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <DashboardNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
