import { fetchServerPageData } from "@/lib/utils/fetchServerPageData";
import { AuditLogsClient } from "./AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function OnboardingAuditLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(sp.pageSize ?? "25") || 25));

  const res = await fetchServerPageData<{
    items: any[];
    meta: any;
  }>(`/api/v1/admin/onboardings/${id}/audit-logs?page=${page}&pageSize=${pageSize}`, {
    redirectOnSessionRequired: true,
    homeRedirectPath: "/login",
  });

  return (
    <AuditLogsClient
      onboardingId={id}
      initialItems={res.data?.items ?? []}
      initialMeta={res.data?.meta ?? null}
      initialError={res.error ?? null}
    />
  );
}


