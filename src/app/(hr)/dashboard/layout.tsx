import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { DashboardThemeProvider } from "@/components/dashboard/theme/DashboardThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardThemeProvider>
  );
}

