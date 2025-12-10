/**
 * Onboarding Entry Page
 *
 * Server-side page component that handles the initial onboarding invitation route.
 * Extracts and validates the invitation token from URL search parameters,
 * then renders the invite screen or an error state.
 *
 * Route: /onboarding?token=<invitation_token>
 *
 * This is a Next.js App Router page component that runs on the server.
 * It reads search parameters synchronously and validates the presence
 * of the required invitation token.
 *
 * @fileoverview Entry point page for employee onboarding invitations.
 */

import { OnboardingInviteScreen } from "./invite-screen";

/**
 * Onboarding Entry Page Component
 *
 * Server-side page component that:
 * 1. Extracts the invitation token from URL search parameters
 * 2. Validates that the token is present
 * 3. Renders either the invite screen (valid token) or error state (missing token)
 *
 * The token is expected in the URL as: ?token=<invitation_token>
 *
 * @param {Object} props - Next.js page component props
 * @param {Object} props.searchParams - URL search parameters
 *
 * @returns {JSX.Element} Invite screen or a friendly error message
 */
export default function OnboardingEntryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tokenParam = searchParams.token;

  const token =
    typeof tokenParam === "string"
      ? tokenParam
      : Array.isArray(tokenParam)
      ? tokenParam[0]
      : undefined;

  if (!token) {
    // Friendly error state when the invitation token is missing
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Invitation link is missing
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This page can only be accessed through a valid onboarding invitation
            link. Please return to your email and click the onboarding link sent
            by NPT HR.
          </p>
        </div>
      </main>
    );
  }

  return <OnboardingInviteScreen inviteToken={token} />;
}
