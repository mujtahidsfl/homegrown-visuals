const BACKUP_EMAIL_ENDPOINT = "https://formsubmit.co/info@softlaunch30.com";
const BACKUP_IFRAME_NAME = "hgv-backup-email-target";
const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzsAWV4PxMdpvJCd_VJ9HFhQ0E7MUCBzzu1vy-jScN2MCb0z7L1mPSgHP2-5CJE9yc/exec";
const GOOGLE_SHEETS_IFRAME_NAME = "hgv-google-sheets-target";

type BackupEmailOptions = {
  subject?: string;
  source?: string;
};

const appendEntry = (params: URLSearchParams, key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return;

  if (Array.isArray(value)) {
    if (value.length === 0) return;
    params.append(key, value.map((item) => String(item)).join(", "));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
      appendEntry(params, `${key}.${nestedKey}`, nestedValue);
    });
    return;
  }

  params.append(key, String(value));
};

const flattenEntries = (value: unknown, prefix = ""): Array<[string, string]> => {
  if (value === null || value === undefined || value === "") return [];

  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return [[prefix, value.map((item) => String(item)).join(", ")]];
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([nestedKey, nestedValue]) =>
      flattenEntries(nestedValue, prefix ? `${prefix}.${nestedKey}` : nestedKey),
    );
  }

  return [[prefix, String(value)]];
};

const toTitleLabel = (key: string) =>
  key
    .split(".")
    .map((part) =>
      part
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .join(" - ");

const buildSummary = (entries: Array<[string, string]>) =>
  entries
    .filter(([key, value]) => Boolean(key && value))
    .map(([key, value]) => `${toTitleLabel(key)}: ${value}`)
    .join("\n");

const ensureBackupIframe = () => {
  const existing = document.querySelector<HTMLIFrameElement>(`iframe[name="${BACKUP_IFRAME_NAME}"]`);
  if (existing) return existing;

  const iframe = document.createElement("iframe");
  iframe.name = BACKUP_IFRAME_NAME;
  iframe.style.display = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);
  return iframe;
};

const ensureHiddenIframe = (name: string) => {
  const existing = document.querySelector<HTMLIFrameElement>(`iframe[name="${name}"]`);
  if (existing) return existing;

  const iframe = document.createElement("iframe");
  iframe.name = name;
  iframe.style.display = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);
  return iframe;
};

const submitHiddenForm = (endpoint: string, iframeName: string, params: URLSearchParams) => {
  if (typeof document === "undefined") return;

  ensureHiddenIframe(iframeName);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.target = iframeName;
  form.style.display = "none";

  Array.from(params.entries()).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  window.setTimeout(() => {
    form.remove();
  }, 1000);
};

const sendBackupRequest = (params: URLSearchParams) => {
  ensureBackupIframe();
  submitHiddenForm(BACKUP_EMAIL_ENDPOINT, BACKUP_IFRAME_NAME, params);
};

const sendGoogleSheetsRequest = (params: URLSearchParams) => {
  submitHiddenForm(GOOGLE_SHEETS_ENDPOINT, GOOGLE_SHEETS_IFRAME_NAME, params);
};

const sendKeepaliveRequest = (endpoint: string, params: URLSearchParams) => {
  const body = params.toString();

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], {
      type: "application/x-www-form-urlencoded;charset=UTF-8",
    });

    if (navigator.sendBeacon(endpoint, blob)) {
      return true;
    }
  }

  if (typeof fetch !== "undefined") {
    void fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    }).catch(() => undefined);

    return true;
  }

  return false;
};

const buildPayloadParams = (
  payload: Record<string, unknown>,
  source?: string,
  subject?: string,
) => {
  const params = new URLSearchParams();
  const summaryEntries = flattenEntries(payload);

  Object.entries(payload).forEach(([key, value]) => {
    appendEntry(params, key, value);
  });

  if (subject) {
    params.append("_captcha", "false");
    params.append("_template", "table");
    params.append("_subject", subject);
    params.append("backup_recipient", "info@softlaunch30.com");
  }

  if (!params.has("submitted_at")) {
    params.append("submitted_at", new Date().toISOString());
  }

  if (source) {
    params.append("source", source);
  }

  if (typeof window !== "undefined" && !params.has("source_page")) {
    params.append("source_page", window.location.href);
    summaryEntries.push(["source_page", window.location.href]);
  }

  params.append("submission_summary", buildSummary(summaryEntries));
  return params;
};

export function sendBackupEmailFromFormData(formData: FormData, options: BackupEmailOptions = {}) {
  const params = new URLSearchParams();
  const summaryEntries: Array<[string, string]> = [];

  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("_")) {
      params.append(key, value);
      if (value !== "") {
        summaryEntries.push([key, value]);
      }
    }
  });

  params.append("_captcha", "false");
  params.append("_template", "table");
  params.append("_subject", options.subject ?? "New Website Form Submission");
  params.append("submitted_at", new Date().toISOString());
  params.append("backup_recipient", "info@softlaunch30.com");

  if (options.source) {
    params.append("source", options.source);
  }

  if (typeof window !== "undefined") {
    params.append("source_page", window.location.href);
    summaryEntries.push(["source_page", window.location.href]);
  }

  params.append("submission_summary", buildSummary(summaryEntries));
  sendBackupRequest(params);
}

export function sendBackupEmailFromPayload(payload: Record<string, unknown>, options: BackupEmailOptions = {}) {
  const params = buildPayloadParams(
    payload,
    options.source,
    options.subject ?? "New Website Form Submission",
  );
  sendBackupRequest(params);
}

export function sendGoogleSheetsFromFormData(formData: FormData, source?: string) {
  const params = new URLSearchParams();
  const summaryEntries: Array<[string, string]> = [];

  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("_")) {
      params.append(key, value);
      if (value !== "") {
        summaryEntries.push([key, value]);
      }
    }
  });

  params.append("submitted_at", new Date().toISOString());
  params.append("destination", "google_sheets");

  if (source) {
    params.append("source", source);
  }

  if (typeof window !== "undefined") {
    params.append("source_page", window.location.href);
    summaryEntries.push(["source_page", window.location.href]);
  }

  params.append("submission_summary", buildSummary(summaryEntries));
  sendGoogleSheetsRequest(params);
}

export function sendGoogleSheetsFromPayload(payload: Record<string, unknown>, source?: string) {
  const params = buildPayloadParams(payload, source);
  params.append("destination", "google_sheets");
  sendGoogleSheetsRequest(params);
}

export function sendBackupEmailFromPayloadKeepalive(
  payload: Record<string, unknown>,
  options: BackupEmailOptions = {},
) {
  const params = buildPayloadParams(
    payload,
    options.source,
    options.subject ?? "New Website Form Submission",
  );
  return sendKeepaliveRequest(BACKUP_EMAIL_ENDPOINT, params);
}

export function sendGoogleSheetsFromPayloadKeepalive(
  payload: Record<string, unknown>,
  source?: string,
) {
  const params = buildPayloadParams(payload, source);
  params.append("destination", "google_sheets");
  return sendKeepaliveRequest(GOOGLE_SHEETS_ENDPOINT, params);
}
