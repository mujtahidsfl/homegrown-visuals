import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { SiteNavbar } from "../components/SiteNavbar";
import { AddressAutocompleteInput } from "../components/AddressAutocompleteInput";
import { useCustomerSession } from "./useCustomerSession";
import { fetchMyInvoices, type CustomerInvoice, type CustomerInvoiceStatus } from "./invoicesApi";
import { addAddress, deleteAddress, listAddresses, loadProfile, saveProfile, updateAddress, type SavedAddress } from "./profileApi";
import {
  ACCOUNT_BODY_STYLE,
  ACCOUNT_HEADING_STYLE,
  ACCOUNT_INPUT,
  ACCOUNT_PRIMARY_BUTTON,
  ACCOUNT_SECONDARY_BUTTON,
} from "./LoginPage";

const SUPPORT_EMAIL = "info@homegrown.marketing";
const LOGIN_REDIRECT = "/account/login?next=/account";

const BADGES: Record<CustomerInvoiceStatus, { label: string; className: string }> = {
  unpaid: { label: "Unpaid", className: "bg-[#fff4e5] text-[#9a3412]" },
  partially_paid: { label: "Partly paid", className: "bg-[#fff4e5] text-[#9a3412]" },
  overdue: { label: "Overdue", className: "bg-[#fde8e8] text-[#b42318]" },
  paid: { label: "Paid", className: "bg-[#e7f6ec] text-[#1a7f37]" },
  void: { label: "Cancelled", className: "bg-[#eef1f5] text-[#51607b]" },
};

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-[#dbe3ef] rounded-[20px] p-6 sm:p-8">
      <h2 className="text-[#1F3A5F] text-[22px] mb-4" style={ACCOUNT_HEADING_STYLE}>{title}</h2>
      {children}
    </div>
  );
}

function InvoicesSection({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [state, setState] = useState<"loading" | "ok" | "unavailable">("loading");
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);

  const load = useCallback(async () => {
    setState("loading");
    const result = await fetchMyInvoices(token);
    if (result.kind === "unauthorized") return onUnauthorized();
    if (result.kind === "unavailable") return setState("unavailable");
    setInvoices(result.invoices);
    setState("ok");
  }, [token, onUnauthorized]);

  useEffect(() => { void load(); }, [load]);

  return (
    <Card title="Invoices">
      {state === "loading" && <p className="text-[#51607b]">Loading invoices…</p>}
      {state === "unavailable" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[#b42318]">Couldn't load invoices — try again.</p>
          <button type="button" className={ACCOUNT_SECONDARY_BUTTON} onClick={() => void load()}>Try again</button>
        </div>
      )}
      {state === "ok" && invoices.length === 0 && (
        <p className="text-[#51607b]">No invoices yet. If you booked with a different email, contact us at {SUPPORT_EMAIL}.</p>
      )}
      {state === "ok" && invoices.length > 0 && (
        <ul className="flex flex-col gap-3">
          {invoices.map((invoice) => {
            const badge = BADGES[invoice.status] ?? BADGES.unpaid;
            return (
              <li key={`${invoice.number}-${invoice.issueDate}`} className="border border-[#e5eaf2] rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#1F3A5F]">Invoice {invoice.number || "—"}</p>
                  <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
                </div>
                <p className="text-[14px] text-[#51607b]">{invoice.issueDate}{invoice.summary ? ` · ${invoice.summary}` : ""}</p>
                <p className="text-[15px] text-[#111111]">Total {money(invoice.total, invoice.currency)}</p>
                {invoice.payUrl && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[14px] text-[#9a3412]">Amount due {money(invoice.amountDue, invoice.currency)}</span>
                    <a className={`${ACCOUNT_PRIMARY_BUTTON} inline-flex items-center`} href={invoice.payUrl} target="_blank" rel="noopener noreferrer">
                      Pay now
                    </a>
                  </div>
                )}
                {invoice.status === "void" && (
                  <p className="text-[13px] text-[#51607b]">This invoice was cancelled. If you think that's a mistake, contact us at {SUPPORT_EMAIL}.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function DetailsSection({ email }: { email: string }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    loadProfile()
      .then((profile) => {
        if (!profile) return;
        setFullName(profile.full_name);
        setPhone(profile.phone);
      })
      .catch(() => setStatus("error"));
  }, []);

  const save = async () => {
    setStatus("saving");
    try {
      await saveProfile({ fullName, phone });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Card title="My details">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1F3A5F]">
          Full name
          <input className={ACCOUNT_INPUT} autoComplete="name" value={fullName} onChange={(e) => { setFullName(e.target.value); setStatus("idle"); }} />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1F3A5F]">
          Phone
          <input className={ACCOUNT_INPUT} type="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setStatus("idle"); }} />
        </label>
        <div className="flex flex-col gap-2 text-[14px] font-semibold text-[#1F3A5F]">
          Email
          <p className="font-normal text-[#51607b]">{email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={ACCOUNT_PRIMARY_BUTTON} disabled={status === "saving"} onClick={() => void save()}>
            {status === "saving" ? "Saving…" : "Save"}
          </button>
          {status === "saved" && <span className="text-[14px] text-[#1a7f37]">Saved</span>}
          {status === "error" && <span className="text-[14px] text-[#b42318]">Couldn't save your details. Please try again.</span>}
        </div>
      </div>
    </Card>
  );
}

function AddressesSection() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listAddresses().then(setAddresses).catch(() => setError("Couldn't load saved addresses."));
  }, []);
  useEffect(refresh, [refresh]);

  const reset = () => { setEditingId(null); setLabel(""); setAddress(""); };

  const submit = async () => {
    setError(null);
    try {
      if (editingId) await updateAddress(editingId, { label, address });
      else await addAddress({ label, address });
      reset();
      refresh();
    } catch {
      setError("Couldn't save that address. Please try again.");
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await deleteAddress(id);
      if (editingId === id) reset();
      refresh();
    } catch {
      setError("Couldn't delete that address. Please try again.");
    }
  };

  return (
    <Card title="Saved addresses">
      {addresses.length === 0 ? (
        <p className="text-[#51607b] mb-4">No saved addresses yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 mb-4">
          {addresses.map((saved) => (
            <li key={saved.id} className="border border-[#e5eaf2] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                {saved.label && <p className="font-semibold text-[#1F3A5F]">{saved.label}</p>}
                <p className="text-[14px] text-[#51607b]">{saved.address}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={ACCOUNT_SECONDARY_BUTTON} onClick={() => { setEditingId(saved.id); setLabel(saved.label); setAddress(saved.address); }}>Edit</button>
                <button type="button" className={ACCOUNT_SECONDARY_BUTTON} onClick={() => void remove(saved.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-semibold text-[#1F3A5F]">{editingId ? "Edit address" : "Add an address"}</p>
        <input className={ACCOUNT_INPUT} placeholder="Label (optional), e.g. Main office listing" value={label} onChange={(e) => setLabel(e.target.value)} />
        <AddressAutocompleteInput value={address} onChange={setAddress} placeholder="Property address" />
        {error && <p role="alert" className="text-[14px] text-[#b42318]">{error}</p>}
        <div className="flex gap-2">
          <button type="button" className={ACCOUNT_PRIMARY_BUTTON} disabled={!address.trim()} onClick={() => void submit()}>
            {editingId ? "Save changes" : "Add address"}
          </button>
          {editingId && <button type="button" className={ACCOUNT_SECONDARY_BUTTON} onClick={reset}>Cancel</button>}
        </div>
      </div>
    </Card>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const { available, ready, session, email, signOut } = useCustomerSession();
  const toLogin = useCallback(() => navigate(LOGIN_REDIRECT, { replace: true }), [navigate]);

  useEffect(() => {
    if (!available || (ready && !session)) toLogin();
  }, [available, ready, session, toLogin]);

  if (!ready || !session || !email) {
    return <section className="min-h-screen bg-[#f6f9fc] px-4 sm:px-8 py-10"><SiteNavbar variant="cool" /></section>;
  }

  return (
    <section className="min-h-screen bg-[#f6f9fc] px-4 sm:px-8 py-10 sm:py-14" style={ACCOUNT_BODY_STYLE}>
      <SiteNavbar variant="cool" />
      <div className="max-w-[860px] mx-auto flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[#1F3A5F] text-[32px] sm:text-[40px]" style={ACCOUNT_HEADING_STYLE}>My account</h1>
          <button type="button" className={ACCOUNT_SECONDARY_BUTTON} onClick={() => void signOut()}>Sign out</button>
        </div>
        <InvoicesSection token={session.access_token} onUnauthorized={toLogin} />
        <DetailsSection email={email} />
        <AddressesSection />
      </div>
    </section>
  );
}
