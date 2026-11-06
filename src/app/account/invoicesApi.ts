export type CustomerInvoiceStatus = "unpaid" | "partially_paid" | "overdue" | "paid" | "void";

export type CustomerInvoice = {
  number: string;
  issueDate: string;
  dueDate: string;
  total: number;
  amountDue: number;
  currency: string;
  status: CustomerInvoiceStatus;
  summary: string;
  payUrl?: string;
};

export type InvoicesResult =
  | { kind: "ok"; invoices: CustomerInvoice[] }
  | { kind: "unauthorized" }
  | { kind: "unavailable" };

type FetchLike = (url: string, init: { headers: Record<string, string> }) => Promise<{ status: number; ok: boolean; json: () => Promise<any> }>;

/**
 * Fetch invoices; on a 401, refresh the session once and retry with the new token.
 * Returns "unauthorized" only when the refreshed token is also rejected (or no
 * refresh was possible), so the caller can safely sign out and go to login.
 */
export async function loadInvoicesWithRefresh(
  accessToken: string,
  refresh: () => Promise<string | null>,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
): Promise<InvoicesResult> {
  const first = await fetchMyInvoices(accessToken, fetchImpl);
  if (first.kind !== "unauthorized") return first;
  const fresh = await refresh().catch(() => null);
  if (!fresh) return { kind: "unauthorized" };
  return fetchMyInvoices(fresh, fetchImpl);
}

/** Fetch the signed-in customer's invoices. Identity comes only from the token. */
export async function fetchMyInvoices(accessToken: string, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<InvoicesResult> {
  try {
    const response = await fetchImpl("/api/hgv-account", { headers: { Authorization: `Bearer ${accessToken}` } });
    if (response.status === 401) return { kind: "unauthorized" };
    if (!response.ok) return { kind: "unavailable" };
    const body = await response.json();
    if (!body?.ok || !Array.isArray(body.invoices)) return { kind: "unavailable" };
    return { kind: "ok", invoices: body.invoices };
  } catch {
    return { kind: "unavailable" };
  }
}
