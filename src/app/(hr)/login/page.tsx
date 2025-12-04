export default function HrLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          HR Portal Login
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This will be the secure login for NPT HR users.
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Authentication and SSO integration will be wired in once backend
          foundations are ready.
        </p>
      </div>
    </main>
  );
}
