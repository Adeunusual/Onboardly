type InvitePageProps = {
  params: {
    inviteToken: string;
  };
};

export default function EmployeeInvitePage({ params }: InvitePageProps) {
  const { inviteToken } = params;

  // Placeholder UI – real implementation will validate token and start flow
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          NPT India • Employee Onboarding
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Welcome to NPTonboard
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          This is the entry point for your digital onboarding. In a later
          version, this page will validate your invite link, verify your
          identity with OTP, and guide you through the required steps.
        </p>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <span className="font-medium">Invite token:</span> {inviteToken}
        </div>

        <button
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled
        >
          Start verification (coming soon)
        </button>
      </div>
    </main>
  );
}
