import { Suspense } from "react";
import { DashboardHomeClient } from "./DashboardHomeClient";

export const dynamic = "force-dynamic";

export default function HrDashboardHomePage() {
  return (
    <Suspense
      fallback={<div className="text-sm text-[var(--dash-muted)]">Loading…</div>}
    >
      <DashboardHomeClient />
    </Suspense>
  );
}
