// src/app/(hr)/dashboard/page.tsx
import ProfileDropdown from "@/components/shared/ProfileDropdown";

export default function HrDashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">HR Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">This will become the main HR dashboard for managing employee onboarding across subsidiaries.</p>
            <p className="mt-4 text-xs text-slate-500">For now this is only a placeholder so the backend team can see the route structure and wire APIs later.</p>
          </div>

          <ProfileDropdown />
        </div>
      </div>
    </main>
  );
}
