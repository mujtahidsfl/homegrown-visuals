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
