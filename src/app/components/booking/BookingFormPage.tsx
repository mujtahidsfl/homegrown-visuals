import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { SiteNavbar } from "../SiteNavbar";
import {
  sendBackupEmailFromPayload,
  sendBackupEmailFromPayloadKeepalive,
  sendGoogleSheetsFromPayload,
  sendGoogleSheetsFromPayloadKeepalive,
} from "../../backupEmail";
import { AddressAutocompleteInput } from "../AddressAutocompleteInput";
import { submitGhlBookingPreflight } from "../../booking/ghlPreflight";
import {
  VIDEO_ORDER_DISCOUNT_NOTE,
  VIDEO_ORDER_DISCOUNT_RATE,
  getDiscountCodeRate,
  getVideoOrderDiscount,
  roundCurrency,
} from "../../booking/discounts";
import {
  BASE_PRICES,
  PACKAGE_ADDONS,
  PACKAGE_DISPLAY,
  PACKAGE_WEBHOOK_URLS,
  SQFT_TIER_OPTIONS,
  type Addon,
  type PackageKey,
  type SqftTierKey,
} from "../../booking/config";

type BookingFormPageProps = {
  packageKey: PackageKey;
};

type BookingState = {
  agent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    brokerage: string;
  };
  property: {
    address: string;
    unit: string;
    sqftTier: SqftTierKey | "";
    listingPrice: string;
    vacancy: string;
    shootBasement: string;
    shootGarage: string;
  };
  addons: string[];
  scheduling: {
    preferredDate: string;
    preferredTime: string;
    backupDate: string;
    notes: string;
  };
  smsConsents: {
    marketing: boolean;
    transactional: boolean;
  };
};

const initialState = (): BookingState => ({
  agent: {
    firstName: (localStorage.getItem("hgv_lead_name") ?? "").split(" ")[0] ?? "",
    lastName: (localStorage.getItem("hgv_lead_name") ?? "").split(" ").slice(1).join(" "),
    email: localStorage.getItem("hgv_lead_email") ?? "",
    phone: "",
    brokerage: "",
  },
  property: {
    address: "",
    unit: "",
    sqftTier: "",
    listingPrice: "",
    vacancy: "",
    shootBasement: "",
    shootGarage: "",
  },
  addons: [],
  scheduling: {
    preferredDate: "",
    preferredTime: "",
    backupDate: "",
    notes: "",
  },
  smsConsents: {
    marketing: false,
    transactional: false,
  },
});

const TODAY = new Date().toISOString().split("T")[0];
const PACKAGE_DRAFT_STORAGE_PREFIX = "hgv_package_booking_draft_v1";
const DRAFT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

const createDraftId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `draft-${Date.now()}`;
  }
};

const currency = (n: number) => {
  const absoluteValue = Math.abs(n);
  return `${n < 0 ? "-" : ""}$${absoluteValue.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(absoluteValue) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};
// Video add-ons eligible for the 10% video order discount. Multi-reel bundles
// (sm_reel_2/3/5) already carry their own volume discount and are excluded.
const VIDEO_DISCOUNT_ADDON_IDS = new Set([
  "cinematic_video",
  "drone_video_30",
  "sm_reel_1",
  "luxury_area",
  "luxury_ai",
  "luxury_day_night",
]);

function addonPrice(addon: Addon, tier: SqftTierKey | "") {
  if (addon.pricingType === "flat") return addon.flatPrice ?? 0;
  if (!tier || !addon.sqftPrices) return 0;
  return addon.sqftPrices[tier] ?? 0;
}

const buildLineItem = (
  id: string,
  name: string,
  category: string,
  amount: number,
) => ({
  id,
  name,
  category,
  quantity: 1,
  unit_amount: amount,
  amount,
});

const formatInvoiceLineItem = (item: ReturnType<typeof buildLineItem>) =>
  `${item.name} - ${currency(item.amount)}`;

const getInvoiceLineItemsText = (lineItems: Array<ReturnType<typeof buildLineItem>>) =>
  lineItems.map(formatInvoiceLineItem).join("\n");

const getStripeInvoiceLinesBody = (lineItems: Array<ReturnType<typeof buildLineItem>>) => {
  const params = new URLSearchParams();
  lineItems.forEach((item, index) => {
    params.append(`lines[${index}][amount]`, String(Math.round(item.amount * 100)));
    params.append(`lines[${index}][description]`, item.name);
  });
  return params.toString();
};

const getInvoiceSummary = (
  lineItems: Array<ReturnType<typeof buildLineItem>>,
  total: number,
  propertyAddress: string,
) =>
  [
    getInvoiceLineItemsText(lineItems),
    `Total - ${currency(total)}`,
    propertyAddress ? `Property Address - ${propertyAddress}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const getDiscountLineItems = ({
  videoDiscount,
  promoCode,
  promoDiscount,
}: {
  videoDiscount: number;
  promoCode: string;
  promoDiscount: number;
}) => {
  const lineItems: Array<ReturnType<typeof buildLineItem>> = [];
  if (videoDiscount > 0) {
    lineItems.push(buildLineItem("video_order_discount", "10% Video Order Discount", "Discount", -videoDiscount));
  }
  const normalizedPromoCode = promoCode.trim();
  if (promoDiscount > 0 && normalizedPromoCode) {
    lineItems.push(buildLineItem("discount_code", `Discount Code (${normalizedPromoCode})`, "Discount", -promoDiscount));
  }
  return lineItems;
};

export function BookingFormPage({ packageKey }: BookingFormPageProps) {
  const navigate = useNavigate();
  const draftRestoredRef = useRef(false);
  const submissionFinalizedRef = useRef(false);
  const abandonmentSentRef = useRef(false);
  const draftIdRef = useRef(createDraftId());
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");

  const packageInfo = PACKAGE_DISPLAY[packageKey];
  const packageAddons = PACKAGE_ADDONS[packageKey];

  const groupedAddons = useMemo(() => {
    const map = new Map<string, Addon[]>();
    packageAddons.forEach((addon) => {
      const current = map.get(addon.category) ?? [];
      current.push(addon);
      map.set(addon.category, current);
    });
    return Array.from(map.entries());
  }, [packageAddons]);

  const basePrice = state.property.sqftTier ? BASE_PRICES[packageKey][state.property.sqftTier] : 0;
  const addonTotal = state.addons.reduce((sum, id) => {
    const addon = packageAddons.find((a) => a.id === id);
    if (!addon) return sum;
    return sum + addonPrice(addon, state.property.sqftTier);
  }, 0);
  const selectedAddonLabels = state.addons
    .map((id) => packageAddons.find((a) => a.id === id))
    .filter(Boolean) as Addon[];
  const subtotal = basePrice + addonTotal;
  const videoDiscountPrices = selectedAddonLabels
    .filter((addon) => VIDEO_DISCOUNT_ADDON_IDS.has(addon.id))
    .map((addon) => addonPrice(addon, state.property.sqftTier));
  const videoDiscount = getVideoOrderDiscount(videoDiscountPrices, subtotal);
  const discountCodeRate = getDiscountCodeRate(discountCode);
  const discountCodeAmount = discountCodeRate ? roundCurrency(subtotal * discountCodeRate) : 0;
  const estimatedTotal = Math.max(0, roundCurrency(subtotal - videoDiscount - discountCodeAmount));
  const draftStorageKey = `${PACKAGE_DRAFT_STORAGE_PREFIX}_${packageKey}`;

  const update = <K extends keyof BookingState>(key: K, value: BookingState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(draftStorageKey);
    }
    abandonmentSentRef.current = false;
    draftIdRef.current = createDraftId();
    setDiscountCode("");
  };

  const buildAbandonmentPayload = () => ({
    form_type: "abandoned_booking_draft",
    abandonment_status: "incomplete",
    draft_id: draftIdRef.current,
    package_name: packageInfo.name,
    package_key: packageKey,
    current_step: step,
    agent: {
      first_name: state.agent.firstName,
      last_name: state.agent.lastName,
      email: state.agent.email,
      phone: state.agent.phone,
      brokerage: state.agent.brokerage,
    },
    property: {
      address: state.property.address,
      unit: state.property.unit,
      sqft_tier: state.property.sqftTier,
      listing_price: state.property.listingPrice,
      vacancy: state.property.vacancy,
      shoot_basement: state.property.shootBasement,
      shoot_garage: state.property.shootGarage,
    },
    addons: selectedAddonLabels.map((addon) => addon.label),
    scheduling: {
      preferred_date: state.scheduling.preferredDate,
      preferred_time: state.scheduling.preferredTime,
      backup_date: state.scheduling.backupDate,
      notes: state.scheduling.notes,
    },
    sms_consents: {
      marketing: state.smsConsents.marketing,
      transactional: state.smsConsents.transactional,
    },
    subtotal,
    discounts: {
      video_order_discount: {
        applied: videoDiscount > 0,
        rate: VIDEO_ORDER_DISCOUNT_RATE,
        amount: videoDiscount,
      },
      promo_code: {
        code: discountCode.trim(),
        applied: discountCodeAmount > 0,
        rate: discountCodeRate,
        amount: discountCodeAmount,
      },
    },
    estimated_total: estimatedTotal,
    source_page: window.location.href,
    submitted_at: new Date().toISOString(),
  });

  useEffect(() => {
    if (typeof window === "undefined" || draftRestoredRef.current) return;

    draftRestoredRef.current = true;

    const rawDraft = localStorage.getItem(draftStorageKey);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as Record<string, any>;
      const savedAt = typeof draft.saved_at === "string" ? Date.parse(draft.saved_at) : NaN;
      if (!Number.isFinite(savedAt) || Date.now() - savedAt > DRAFT_MAX_AGE_MS) {
        localStorage.removeItem(draftStorageKey);
        return;
      }
      if (draft.draft_id) {
        draftIdRef.current = draft.draft_id;
      }
      if (typeof draft.step === "number") {
        setStep(draft.step);
      }
      if (draft.state) {
        setState(draft.state as BookingState);
      }
      if (typeof draft.discountCode === "string") {
        setDiscountCode(draft.discountCode);
      }
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftRestoredRef.current) return;

    const hasMeaningfulProgress =
      step > 1 ||
      Boolean(
        state.agent.firstName.trim() ||
          state.agent.lastName.trim() ||
          state.agent.email.trim() ||
          state.agent.phone.trim() ||
          state.property.address.trim(),
      );

    if (!hasMeaningfulProgress) {
      localStorage.removeItem(draftStorageKey);
      return;
    }

    localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        draft_id: draftIdRef.current,
        saved_at: new Date().toISOString(),
        package_key: packageKey,
        step,
        state,
        discountCode,
      }),
    );

    abandonmentSentRef.current = false;
  }, [discountCode, draftStorageKey, packageKey, state, step]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasMeaningfulProgress =
      step > 1 ||
      Boolean(
        state.agent.firstName.trim() ||
          state.agent.lastName.trim() ||
          state.agent.email.trim() ||
          state.agent.phone.trim() ||
          state.property.address.trim(),
      );

    const handleAbandonment = () => {
      if (
        submissionFinalizedRef.current ||
        abandonmentSentRef.current ||
        !hasMeaningfulProgress
      ) {
        return;
      }

      abandonmentSentRef.current = true;
      const payload = buildAbandonmentPayload();
      sendBackupEmailFromPayloadKeepalive(payload, {
        source: "package_booking_form_abandoned",
        subject: `Abandoned ${packageInfo.name} Booking Draft`,
      });
      sendGoogleSheetsFromPayloadKeepalive(payload, "package_booking_form_abandoned");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleAbandonment();
      }
    };

    window.addEventListener("pagehide", handleAbandonment);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleAbandonment);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [discountCode, discountCodeAmount, discountCodeRate, estimatedTotal, packageInfo.name, state, step, subtotal, videoDiscount]);

  const next = () => {
    if (step === 1) {
      const { firstName, lastName, email, phone } = state.agent;
      if (!firstName || !lastName || !email || !phone) return;
    }
    if (step === 2) {
      const { address, sqftTier, vacancy, shootBasement, shootGarage } = state.property;
      if (!address || !sqftTier || !vacancy || !shootBasement || !shootGarage) return;
    }
    if (step === 4) {
      const { preferredDate, preferredTime } = state.scheduling;
      if (!preferredDate || !preferredTime) return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const toggleAddon = (id: string) => {
    setState((prev) => {
      const exists = prev.addons.includes(id);
      return { ...prev, addons: exists ? prev.addons.filter((x) => x !== id) : [...prev.addons, id] };
    });
  };

  const submit = async () => {
    const webhookUrl = PACKAGE_WEBHOOK_URLS[packageKey];
    const addonLabels = selectedAddonLabels.map((addon) => addon.label);
    const baseLineItems = [
      ...(state.property.sqftTier
        ? [
            buildLineItem(
              packageKey,
              packageInfo.name,
              "Package",
              BASE_PRICES[packageKey][state.property.sqftTier],
            ),
          ]
        : []),
      ...selectedAddonLabels
        .map((addon) => buildLineItem(addon.id, addon.label, addon.category, addonPrice(addon, state.property.sqftTier)))
        .filter((item) => item.amount > 0),
    ];
    const discountLineItems = getDiscountLineItems({
      videoDiscount,
      promoCode: discountCode,
      promoDiscount: discountCodeAmount,
    });
    const lineItems = [...baseLineItems, ...discountLineItems];
    const buildPayload = (retryMode?: string) => {
      const submittedAt = new Date().toISOString();
      const fullName = `${state.agent.firstName} ${state.agent.lastName}`.trim();

      return {
        form_type: "booking",
        website_booking_id: draftIdRef.current,
        ...(retryMode ? { retry_mode: retryMode } : {}),
        package_name: packageKey,
        package: packageInfo.name,
        property_address: state.property.address,
        sqft_tier: state.property.sqftTier,
        selections: addonLabels,
        subtotal,
        discounts: {
          video_order_discount: {
            applied: videoDiscount > 0,
            rate: VIDEO_ORDER_DISCOUNT_RATE,
            amount: videoDiscount,
          },
          promo_code: {
            code: discountCode.trim(),
            applied: discountCodeAmount > 0,
            rate: discountCodeRate,
            amount: discountCodeAmount,
          },
        },
        line_items: lineItems,
        invoice_line_items: lineItems,
        invoice_line_items_json: JSON.stringify(lineItems),
        invoice_line_items_stripe_form: getStripeInvoiceLinesBody(lineItems),
        invoice_line_items_text: getInvoiceLineItemsText(lineItems),
        invoice_summary: getInvoiceSummary(lineItems, estimatedTotal, state.property.address),
        invoice_total_label: currency(estimatedTotal),
        schedule: {
          preferredDate: state.scheduling.preferredDate,
          preferredTime: state.scheduling.preferredTime,
          backupDate: state.scheduling.backupDate,
          notes: state.scheduling.notes,
        },
        contact: {
          fullName,
          first_name: state.agent.firstName,
          last_name: state.agent.lastName,
          email: state.agent.email,
          phone: state.agent.phone,
          brokerage: state.agent.brokerage,
        },
        access: {
          vacancy: state.property.vacancy,
          access: state.property.vacancy,
          lockbox: "",
          gate_code: "",
        },
        special_requests: state.scheduling.notes,
        additional_info: state.scheduling.notes,
        agent: {
          first_name: state.agent.firstName,
          last_name: state.agent.lastName,
          email: state.agent.email,
          phone: state.agent.phone,
          brokerage: state.agent.brokerage,
        },
        property: {
          address: state.property.address,
          unit: state.property.unit,
          sqft_tier: state.property.sqftTier,
          listing_price: state.property.listingPrice,
          vacancy: state.property.vacancy,
          shoot_basement: state.property.shootBasement,
          shoot_garage: state.property.shootGarage,
        },
        addons: addonLabels,
        discount_code: discountCode.trim(),
        estimated_total: estimatedTotal,
        scheduling: {
          preferred_date: state.scheduling.preferredDate,
          preferred_time: state.scheduling.preferredTime,
          backup_date: state.scheduling.backupDate,
          notes: state.scheduling.notes,
        },
        sms_consents: {
          marketing: state.smsConsents.marketing,
          transactional: state.smsConsents.transactional,
        },
        submitted_at: submittedAt,
        source_page: window.location.href,
        meta: {
          webhook_url: webhookUrl,
          source_page: window.location.href,
          submitted_at: submittedAt,
        },
      };
    };

    let preflightComplete = false;
    let payload: ReturnType<typeof buildPayload> | null = null;
    try {
      setSubmitting(true);
      setError(null);
      payload = buildPayload();
      await submitGhlBookingPreflight(payload);
      preflightComplete = true;

      sendBackupEmailFromPayload(payload, {
        source: "package_booking_form",
        subject: `Backup Copy - ${packageInfo.name} Booking`,
      });
      sendGoogleSheetsFromPayload(payload, "package_booking_form");

      const response = await fetch(webhookUrl, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      submissionFinalizedRef.current = true;
      clearDraft();
      localStorage.setItem("hgv_lead_email", state.agent.email);
      localStorage.setItem(
        "hgv_booking_summary",
        JSON.stringify({
          package_name: packageInfo.name,
          address: state.property.address,
          shoot_date: state.scheduling.preferredDate,
          shoot_time: state.scheduling.preferredTime,
          estimated_total: estimatedTotal,
        })
      );

      navigate("/confirmation");
    } catch (e) {
      if (!preflightComplete || !payload) {
        setError("We couldn't prepare the booking details in the CRM right now. Please try again.");
        return;
      }

      try {
        // Fallback for endpoints that reject CORS preflight.
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          keepalive: true,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify({ ...payload, retry_mode: "no-cors-fallback" }),
        });
      } catch {
        // Last-resort fire-and-forget fallback for browsers/networks that block cross-origin fetch.
        const ok = navigator.sendBeacon(
          webhookUrl,
          JSON.stringify({ ...payload, retry_mode: "sendBeacon-fallback" })
        );

        if (!ok) {
          setError("We couldn't submit the form right now. Please try again.");
          return;
        }
      }

      localStorage.setItem("hgv_lead_email", state.agent.email);
      localStorage.setItem(
        "hgv_booking_summary",
        JSON.stringify({
          package_name: packageInfo.name,
          address: state.property.address,
          shoot_date: state.scheduling.preferredDate,
          shoot_time: state.scheduling.preferredTime,
          estimated_total: estimatedTotal,
        })
      );
      navigate("/confirmation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f4f8fc] pb-40">
      <SiteNavbar variant="cool" />
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 pt-8 sm:pt-10">
        <div className="bg-white border border-[#dbe3ef] rounded-[16px] p-4 sm:p-5 shadow-[0_8px_20px_rgba(31,58,95,0.08)]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-[#1F3A5F] text-[14px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
              {packageInfo.name}
            </p>
            <p className="text-[#1F3A5F]/70 text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
              Step {step} of 5
            </p>
          </div>
          <div className="h-2 bg-[#e7edf5] rounded-full overflow-hidden">
            <div className="h-full bg-[#2FA4A9] transition-all" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#dbe3ef] rounded-[20px] p-6 sm:p-8 shadow-[0_14px_30px_rgba(31,58,95,0.08)]">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[#1F3A5F] text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Tell us about yourself</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {([
                  ["firstName", "First Name", state.agent.firstName],
                  ["lastName", "Last Name", state.agent.lastName],
                  ["email", "Email", state.agent.email],
                  ["phone", "Phone Number", state.agent.phone],
                  ["brokerage", "Brokerage Name", state.agent.brokerage],
                ] as const).map(([key, label, value]) => (
                  <input
                    key={key}
                    placeholder={label}
                    value={value}
                    onChange={(e) => update("agent", { ...state.agent, [key]: e.target.value })}
                    className="h-12 px-4 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9]"
                  />
                ))}
              </div>
              <div className="rounded-[12px] border border-[#d7e0eb] p-4 sm:p-5 space-y-3.5">
                <p className="text-[#1F3A5F] text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  SMS Consent (required to receive text updates)
                </p>

                <label className="flex items-start gap-2.5 text-[13px] text-[#41516b]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.smsConsents.marketing}
                    onChange={(e) =>
                      update("smsConsents", { ...state.smsConsents, marketing: e.target.checked })
                    }
                  />
                  <span>
                    I consent to receive marketing text messages, about special offers, discounts, and service updates, from Homegrown Visuals at the phone number provided. Message frequency may vary. Message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-[13px] text-[#41516b]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.smsConsents.transactional}
                    onChange={(e) =>
                      update("smsConsents", { ...state.smsConsents, transactional: e.target.checked })
                    }
                  />
                  <span>
                    I consent to receive non-marketing text messages from Homegrown Visuals about booking confirmations, appointment reminders, and media delivery updates. Message frequency may vary, message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.
                  </span>
                </label>

                <p className="text-[12px] text-[#5b6982]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                  SMS consent is optional and not required to submit your booking request.
                </p>
                <p className="text-[12px] text-[#5b6982]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                  By continuing, you agree to our{" "}
                  <Link to="/terms-of-service" className="underline text-[#1F3A5F]">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="underline text-[#1F3A5F]">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[#1F3A5F] text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>About the property</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <AddressAutocompleteInput
                  placeholder="Property Address"
                  value={state.property.address}
                  onChange={(address) => update("property", { ...state.property, address })}
                  className="h-12 px-4 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9] sm:col-span-2"
                />
                <input placeholder="Unit Number (optional)" value={state.property.unit} onChange={(e) => update("property", { ...state.property, unit: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]" />
                <select value={state.property.sqftTier} onChange={(e) => update("property", { ...state.property, sqftTier: e.target.value as SqftTierKey })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]">
                  <option value="">Square Footage</option>
                  {SQFT_TIER_OPTIONS.map((tier) => <option key={tier.key} value={tier.key}>{tier.label}</option>)}
                </select>
                <input placeholder="Listing Price" value={state.property.listingPrice} onChange={(e) => update("property", { ...state.property, listingPrice: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]" />
                <select value={state.property.vacancy} onChange={(e) => update("property", { ...state.property, vacancy: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]"><option value="">Vacancy Status</option><option>Occupied</option><option>Vacant</option></select>
                <select value={state.property.shootBasement} onChange={(e) => update("property", { ...state.property, shootBasement: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]"><option value="">Shoot Basement?</option><option>Yes</option><option>No</option></select>
                <select value={state.property.shootGarage} onChange={(e) => update("property", { ...state.property, shootGarage: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]"><option value="">Shoot Garage Interior?</option><option>Yes</option><option>No</option></select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-[#1F3A5F] text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Customize your shoot</h2>
              <p className="text-[#51607b] mt-2">All prices update based on your square footage selection.</p>
              <div className="mt-5 grid md:grid-cols-2 gap-5">
                {groupedAddons.map(([category, addons]) => (
                  <div key={category} className="border border-[#dbe3ef] rounded-[14px] p-4">
                    <p className="text-[#1F3A5F] font-semibold">{category}</p>
                    {addons.some((addon) => VIDEO_DISCOUNT_ADDON_IDS.has(addon.id)) ? (
                      <p className="mt-1 mb-3 text-[12px] leading-5 text-[#1f7a4d] font-semibold">{VIDEO_ORDER_DISCOUNT_NOTE}</p>
                    ) : (
                      <div className="mb-3" />
                    )}
                    <div className="space-y-2.5">
                      {addons.map((addon) => (
                        <label key={addon.id} className="flex items-center justify-between gap-3 text-[14px]">
                          <span className="flex items-center gap-2">
                            <input type="checkbox" checked={state.addons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
                            {addon.label}
                          </span>
                          <span className="text-[#1F3A5F] font-semibold">{currency(addonPrice(addon, state.property.sqftTier))}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-[#1F3A5F] text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>When would you like us there?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="date" min={TODAY} value={state.scheduling.preferredDate} onChange={(e) => update("scheduling", { ...state.scheduling, preferredDate: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]" />
                <select value={state.scheduling.preferredTime} onChange={(e) => update("scheduling", { ...state.scheduling, preferredTime: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]">
                  <option value="">Preferred Time</option>
                  <option>Morning (8am - 11am)</option>
                  <option>Midday (11am - 2pm)</option>
                  <option>Afternoon (2pm - 5pm)</option>
                </select>
                <input type="date" min={TODAY} value={state.scheduling.backupDate} onChange={(e) => update("scheduling", { ...state.scheduling, backupDate: e.target.value })} className="h-12 px-4 rounded-[12px] border border-[#d7e0eb]" />
                <textarea placeholder="Special instructions / access notes" value={state.scheduling.notes} onChange={(e) => update("scheduling", { ...state.scheduling, notes: e.target.value })} className="sm:col-span-2 min-h-[120px] p-4 rounded-[12px] border border-[#d7e0eb]" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-[#1F3A5F] text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Review your booking</h2>
              <div className="border border-[#dbe3ef] rounded-[14px] p-5 space-y-2 text-[15px]">
                <p><b>Agent:</b> {state.agent.firstName} {state.agent.lastName} · {state.agent.email} · {state.agent.phone}</p>
                <p><b>Brokerage:</b> {state.agent.brokerage || "-"}</p>
                <p><b>Property:</b> {state.property.address} {state.property.unit ? `, Unit ${state.property.unit}` : ""}</p>
                <p><b>Sqft Tier:</b> {SQFT_TIER_OPTIONS.find((x) => x.key === state.property.sqftTier)?.label ?? "-"}</p>
                <p><b>Package:</b> {packageInfo.name}</p>
                <p><b>Add-ons:</b> {selectedAddonLabels.length ? selectedAddonLabels.map((x) => x.label).join(", ") : "None"}</p>
                <p><b>Shoot Date:</b> {state.scheduling.preferredDate || "-"} · {state.scheduling.preferredTime || "-"}</p>
                <div className="pt-3 mt-3 border-t border-[#dbe3ef]">
                  <label className="block text-[13px] font-semibold text-[#1F3A5F]">Discount code</label>
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="If applicable, apply discount code here"
                    className="mt-1 h-11 w-full px-4 rounded-[12px] border border-[#d7e0eb]"
                  />
                  {discountCode.trim() && !discountCodeRate ? (
                    <p className="mt-1 text-[12px] text-[#c84848]">Code not recognized.</p>
                  ) : null}
                </div>
                {subtotal !== estimatedTotal ? (
                  <div className="pt-2 mt-2 border-t border-[#dbe3ef] space-y-1">
                    <p><b>Subtotal:</b> {currency(subtotal)}</p>
                    {videoDiscount > 0 ? <p className="text-[#1f7a4d]"><b>10% video order discount:</b> {currency(-videoDiscount)}</p> : null}
                    {discountCodeAmount > 0 ? <p className="text-[#1f7a4d]"><b>Discount code:</b> {currency(-discountCodeAmount)}</p> : null}
                  </div>
                ) : null}
                <p className="pt-2 mt-2 border-t border-[#dbe3ef] text-[18px]"><b>Total:</b> {currency(estimatedTotal)}</p>
              </div>
              {error && <p className="text-[#c84848]">{error}</p>}
            </div>
          )}

          <div className="mt-7 flex justify-between">
            <button onClick={prev} disabled={step === 1 || submitting} className="h-11 px-5 rounded-full border border-[#ccd5e3] disabled:opacity-40">Back</button>
            {step < 5 ? (
              <button onClick={next} className="h-11 px-6 rounded-full bg-[#1F3A5F] text-white">Next</button>
            ) : (
              <button onClick={submit} disabled={submitting} className="h-11 px-6 rounded-full bg-[#1F3A5F] text-white disabled:opacity-50">
                {submitting ? "Submitting..." : "Confirm Booking →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#d1dbea] bg-white/96 backdrop-blur-sm">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-[13px] sm:text-[14px] text-[#1F3A5F]/80">
            <span className="font-semibold">{packageInfo.name}</span>
            <span className="mx-2">•</span>
            <span>{SQFT_TIER_OPTIONS.find((x) => x.key === state.property.sqftTier)?.label ?? "Select sqft tier"}</span>
            {selectedAddonLabels.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>{selectedAddonLabels.map((a) => a.label).join(", ")}</span>
              </>
            )}
          </div>
          <p className="text-[#1F3A5F] text-[16px] sm:text-[18px] font-semibold">Estimated Total: {currency(estimatedTotal)}</p>
        </div>
      </div>
    </section>
  );
}
