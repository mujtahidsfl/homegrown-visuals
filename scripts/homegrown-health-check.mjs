import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dns from "node:dns/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const outputDir = resolve(repoRoot, "..", "..", "outputs");
const locationId = process.env.GHL_LOCATION_ID || "pwyt4yVmaVxmQpVX040D";
const liveUrl = "https://www.homegrownvisualsmedia.com";
const ghlBaseUrl = "https://services.leadconnectorhq.com";
const ghlVersion = "2021-07-28";
const sinceDefault = "2026-08-01T00:00:00-05:00";
const servicesFlowPath = join(repoRoot, "src", "app", "components", "ServicesBookingFlow.tsx");

const fieldIds = {
  websiteBookingId: "3fCYGFx27GKKXuCCW1Yu",
  meetingDate: "NkYdDCFdhusSScihhJCR",
  meetingStart: "a9ClThbLnmfY4pCLDvfJ",
  meetingEnd: "seYFjVRZWYUe2icf3kF0",
  invoiceDue: "VgxcNy6LYmRZoaGhx2b5",
  paymentLink: "pmY4fF7mR7G4KrJFCbhm",
  propertyAddress: "hykb9sK1p3HJLFYCG3QC",
  package: "nowyXiwMJG9SXRuvFsh3",
  invoiceLines: "slKug5Qij1s4OAWFwZH0",
};

const stageNames = {
  "e3233389-1aad-4c59-94a2-5892da6e1819": "New Inquiry",
  "aebfeca7-7682-403a-927d-cdfa6433fad2": "Custom Quote Request",
  "9bb5bc5e-2170-456c-823e-2b7fb8cbfdf6": "Qualified/ Assign to Photographer",
  "718b89c2-fd81-4d13-9ddd-0eb593803f12": "Photographer Assigned",
  "60e2ebde-9f69-4167-8c25-067036a400db": "Awaiting Confirmation",
  "f6ddeb17-ecc0-48c8-a923-4bad28795991": "Booking Confirmed",
  "8a422cce-2020-42dc-ad94-5cf59962c394": "Introduction Sent",
  "34062840-e1f4-4ab9-939d-f0ad5721eaf0": "Shoot Completed",
  "0c78f78f-763a-4055-935c-048868c9dcda": "Editing / Gallery Creation",
  "b1fee3c9-2840-4ca4-aa68-a75ef5d03412": "Delivered & Invoiced",
  "c5bef0b3-314a-4004-b865-771d63adafa1": "Review Requested",
};

const criticalWorkflows = [
  {
    id: "dd719c59-fe36-4566-947c-bea82b30ffb0",
    name: "1. Appointments Confirmation Request (Internal)",
  },
  {
    id: "f47e1aff-9ba6-4782-bc5e-1045898d3b6b",
    name: "2. Appointments Confirmed",
  },
  {
    id: "cbf6ee5e-b948-4816-b4c9-0d14622d7605",
    name: "2.B Appointments Confirmed Reminder",
  },
  {
    id: "dea2b23d-21eb-4f75-922b-73339ecf82c7",
    name: "Assign Opportunity on Meeting",
  },
  {
    id: "20c3d3bf-1fb2-4c80-a201-2a52ac02a5bb",
    name: "Booking Confirmed - Triggering Invoice",
  },
  {
    id: "54a69575-59ad-431c-8948-27d9fb94b357",
    name: "Appointment Cancelled - Stop Reminders",
  },
];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

for (const candidate of [
  resolve(repoRoot, ".env"),
  resolve(repoRoot, "..", ".env"),
  resolve(repoRoot, "..", "..", ".env"),
  resolve(process.env.HOME || "", ".claude", ".env"),
]) {
  loadEnvFile(candidate);
}

const ghlToken = process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;

function fieldValue(opportunity, id) {
  const field = (opportunity.customFields || []).find((item) => item.id === id);
  return field?.fieldValueString ?? field?.fieldValueDate ?? field?.value ?? "";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { text: text.slice(0, 500) };
  }
  return { ok: response.ok, status: response.status, body, text };
}

async function ghlGet(path) {
  if (!ghlToken) throw new Error("Missing GHL_PIT or GHL_HOMEGROWN_API_TOKEN");
  const response = await fetchJson(`${ghlBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${ghlToken}`,
      Version: ghlVersion,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${path}: ${JSON.stringify(response.body).slice(0, 500)}`);
  }
  return response.body;
}

async function checkWebsite() {
  const response = await fetch(`${liveUrl}/services`, { method: "GET" });
  const html = await response.text();
  const asset = html.match(/\/assets\/index-[^" ]+\.js/)?.[0] || null;
  const markers = {};
  if (asset) {
    const js = await fetch(`${liveUrl}${asset}`).then((res) => res.text());
    for (const marker of [
      "website_booking_id",
      "prefillContact",
      "booking-preflight",
      "Drone Clips",
      "invoice_line_items_text",
      "invoice_summary",
      "Discount Code",
      "10% Video Order Discount",
      "Vacant Land Package",
    ]) {
      markers[marker] = (js.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    }
  }

  const preflight = await fetchJson(`${liveUrl}/api/hgv-booking-preflight?dry_run=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dry_run: true,
      website_booking_id: "health-check-no-write",
      property: { address: "Health Check Dry Run Address" },
      contact: {
        fullName: "Health Check",
        email: "health-check@example.com",
      },
    }),
  });

  return {
    status: response.status,
    asset,
    markers,
    preflight: preflight.body,
  };
}

async function safeResolve(fn) {
  try {
    return await fn();
  } catch {
    return [];
  }
}

async function checkDns() {
  return {
    mgSpf: await safeResolve(() => dns.resolveTxt("mg.homegrownvisualsmedia.com")),
    mgDkim: await safeResolve(() => dns.resolveTxt("smtp._domainkey.mg.homegrownvisualsmedia.com")),
    mgMx: await safeResolve(() => dns.resolveMx("mg.homegrownvisualsmedia.com")),
    rootMx: await safeResolve(() => dns.resolveMx("homegrownvisualsmedia.com")),
    rootDmarc: await safeResolve(() => dns.resolveTxt("_dmarc.homegrownvisualsmedia.com")),
  };
}

function parseCalendarIdsFromSource() {
  if (!existsSync(servicesFlowPath)) return { deanOnly: [], roundRobin: [] };
  const source = readFileSync(servicesFlowPath, "utf8");
  const getBlockIds = (constName) => {
    const start = source.indexOf(`const ${constName}`);
    if (start === -1) return [];
    const end = source.indexOf("};", start);
    if (end === -1) return [];
    const block = source.slice(start, end);
    return [...block.matchAll(/widget\/booking\/([A-Za-z0-9]+)/g)].map((match) => match[1]);
  };

  return {
    deanOnly: getBlockIds("DEAN_BUCKET_CALENDARS"),
    roundRobin: getBlockIds("ROUND_ROBIN_BUCKET_CALENDARS"),
  };
}

function selectedTeamMembers(calendar) {
  return (calendar.teamMembers || []).filter((member) => member.selected !== false);
}

function appointmentDisplayValues(event) {
  const start = event.startTime ? new Date(event.startTime) : null;
  const end = event.endTime ? new Date(event.endTime) : null;
  const validStart = start && !Number.isNaN(start.valueOf());
  const validEnd = end && !Number.isNaN(end.valueOf());
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    date: validStart ? dateFormatter.format(start) : "",
    start: validStart ? timeFormatter.format(start) : "",
    end: validEnd ? timeFormatter.format(end) : "",
    durationMinutes: validStart && validEnd ? Math.round((end.valueOf() - start.valueOf()) / 60000) : null,
  };
}

function expectedCalendarDuration(calendarName) {
  const match = String(calendarName || "").trim().match(/(\d+)\s*(?:min)?$/i);
  return match ? Number(match[1]) : null;
}

function checkCalendarRouting(calendars) {
  const ids = parseCalendarIdsFromSource();
  const byId = new Map(calendars.map((calendar) => [calendar.id, calendar]));
  const issues = [];
  const rows = [];

  for (const id of ids.deanOnly) {
    const calendar = byId.get(id);
    const members = selectedTeamMembers(calendar || {});
    rows.push({ id, expected: "Dean Only", name: calendar?.name || null, selectedUserCount: members.length });
    if (!calendar) {
      issues.push(`Website Dean-only calendar ${id} is missing from GHL`);
    } else if (members.length !== 1) {
      issues.push(`Website Dean-only calendar ${calendar.name} has ${members.length} selected users`);
    }
  }

  for (const id of ids.roundRobin) {
    const calendar = byId.get(id);
    const members = selectedTeamMembers(calendar || {});
    rows.push({ id, expected: "Dean + Brayden", name: calendar?.name || null, selectedUserCount: members.length });
    if (!calendar) {
      issues.push(`Website round-robin calendar ${id} is missing from GHL`);
    } else if (members.length < 2) {
      issues.push(`Website round-robin calendar ${calendar.name} has only ${members.length} selected user(s)`);
    }
  }

  return {
    sourceIds: ids,
    checked: rows,
    issues,
  };
}

async function getCalendars() {
  return (await ghlGet(`/calendars/?locationId=${locationId}`)).calendars || [];
}

async function getWorkflows() {
  return (await ghlGet(`/workflows/?locationId=${locationId}`)).workflows || [];
}

function checkCriticalWorkflows(workflows) {
  const byId = new Map(workflows.map((workflow) => [workflow.id, workflow]));
  const byName = new Map(workflows.map((workflow) => [workflow.name, workflow]));
  const rows = [];
  const issues = [];

  for (const expected of criticalWorkflows) {
    const workflow = byId.get(expected.id) || byName.get(expected.name) || null;
    const row = {
      expectedName: expected.name,
      expectedId: expected.id,
      id: workflow?.id || null,
      name: workflow?.name || null,
      status: workflow?.status || "missing",
      version: workflow?.version ?? null,
      updatedAt: workflow?.updatedAt || null,
      createdAt: workflow?.createdAt || null,
    };

    if (!workflow) {
      issues.push(`Critical workflow missing: ${expected.name}`);
    } else if (workflow.status !== "published") {
      issues.push(`Critical workflow is ${workflow.status}: ${workflow.name}`);
    }

    if (workflow && workflow.id !== expected.id) {
      issues.push(`Critical workflow ID changed for ${expected.name}: expected ${expected.id}, found ${workflow.id}`);
    }

    rows.push(row);
  }

  return { checked: rows, issues };
}

async function getFutureEvents(calendars) {
  const startTime = Date.now() - 12 * 60 * 60 * 1000;
  const endTime = Date.now() + 45 * 24 * 60 * 60 * 1000;
  const events = [];

  for (const calendar of calendars) {
    const body = await ghlGet(
      `/calendars/events?locationId=${locationId}&calendarId=${calendar.id}&startTime=${startTime}&endTime=${endTime}`,
    );
    for (const event of body.events || []) {
      if (!event.deleted) {
        events.push({
          ...event,
          calendarName: calendar.name,
          calendarTeamMemberIds: selectedTeamMembers(calendar).map((member) => member.userId),
        });
      }
    }
  }

  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  return events;
}

async function checkFutureBookings(calendars) {
  const events = await getFutureEvents(calendars);
  const report = [];

  for (const event of events) {
    const contact = (await ghlGet(`/contacts/${event.contactId}`)).contact || {};
    const opportunities =
      (await ghlGet(`/opportunities/search?location_id=${locationId}&contact_id=${event.contactId}&limit=50`))
        .opportunities || [];
    const coreOpen = opportunities.filter(
      (opportunity) => opportunity.pipelineId === "xBrSZz2liyIoEfZKQ8Uj" && opportunity.status === "open",
    );
    const rows = coreOpen.map((opportunity) => ({
      id: opportunity.id,
      name: opportunity.name,
      stage: stageNames[opportunity.pipelineStageId] || opportunity.pipelineStageId,
      assignedTo: opportunity.assignedTo || null,
      value: opportunity.monetaryValue,
      updatedAt: opportunity.updatedAt,
      fields: {
        package: fieldValue(opportunity, fieldIds.package),
        propertyAddress: fieldValue(opportunity, fieldIds.propertyAddress),
        websiteBookingId: fieldValue(opportunity, fieldIds.websiteBookingId),
        meetingDate: fieldValue(opportunity, fieldIds.meetingDate),
        meetingStart: fieldValue(opportunity, fieldIds.meetingStart),
        meetingEnd: fieldValue(opportunity, fieldIds.meetingEnd),
        paymentLink: fieldValue(opportunity, fieldIds.paymentLink),
        invoiceDue: fieldValue(opportunity, fieldIds.invoiceDue),
        invoiceLines: fieldValue(opportunity, fieldIds.invoiceLines),
      },
    }));
    const current =
      rows
        .filter((row) => row.fields.meetingDate || row.fields.meetingStart || row.fields.propertyAddress)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || rows[0];
    const status = event.appointmentStatus || event.appoinmentStatus || "unknown";
    const risks = [];
    if (status !== "confirmed") risks.push("appointment is not confirmed");
    if (rows.length > 1) risks.push(`${rows.length} open opportunities on same contact`);
    if (current && !current.fields.propertyAddress) risks.push("current opportunity missing property address");
    if (current && !current.fields.websiteBookingId) risks.push("current opportunity missing website booking ID");
    if (current && (!current.fields.meetingDate || !current.fields.meetingStart || !current.fields.meetingEnd)) {
      risks.push("current opportunity missing meeting date/time fields");
    }
    if (current?.fields.meetingDate && current?.fields.meetingStart && current?.fields.meetingEnd) {
      const expected = appointmentDisplayValues(event);
      const actual = {
        date: String(current.fields.meetingDate),
        start: String(current.fields.meetingStart),
        end: String(current.fields.meetingEnd),
      };
      if (actual.date !== expected.date || actual.start !== expected.start || actual.end !== expected.end) {
        risks.push(
          `opportunity meeting date/time ${actual.date} ${actual.start}-${actual.end} does not match appointment ${expected.date} ${expected.start}-${expected.end}`,
        );
      }
    }
    const appointmentValues = appointmentDisplayValues(event);
    const calendarDuration = expectedCalendarDuration(event.calendarName);
    if (
      calendarDuration
      && appointmentValues.durationMinutes !== null
      && appointmentValues.durationMinutes !== calendarDuration
    ) {
      risks.push(
        `appointment duration is ${appointmentValues.durationMinutes} minutes on a ${calendarDuration}-minute calendar`,
      );
    }
    if (current?.stage === "Booking Confirmed") {
      if (!current.fields.paymentLink) risks.push("confirmed opportunity missing Stripe payment link");
      if (!current.fields.invoiceDue) risks.push("confirmed opportunity missing invoice due date");
      if (!current.fields.invoiceLines) risks.push("confirmed opportunity missing invoice line-item payload");
    }
    const packageName = String(current?.fields.package || current?.name || "").toLowerCase();
    if (packageName.includes("luxury") && selectedTeamMembers({ teamMembers: event.calendarTeamMemberIds?.map((userId) => ({ userId })) }).length > 1) {
      risks.push("luxury booking is on a Dean + Brayden calendar instead of a Dean-only calendar");
    }

    report.push({
      event: {
        id: event.id,
        title: event.title,
        status,
        calendar: event.calendarName,
        calendarTeamMemberIds: event.calendarTeamMemberIds || [],
        start: event.startTime,
        end: event.endTime,
        assignedUserId: event.assignedUserId,
      },
      contact: {
        id: event.contactId,
        name: contact.contactName || `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
        email: contact.email,
        phone: contact.phone,
      },
      risks,
      currentOpportunity: current || null,
      openOpportunityCount: rows.length,
    });
  }

  return report;
}

async function checkRecentConfirmations() {
  const since = Date.parse(process.env.HGV_AUDIT_CONFIRMATIONS_SINCE || sinceDefault);
  const conversations = (await ghlGet(`/conversations/search?locationId=${locationId}&limit=100`)).conversations || [];
  const recent = conversations.filter(
    (conversation) => Number(conversation.lastMessageDate || 0) >= since || Number(conversation.dateUpdated || 0) >= since,
  );
  const confirmations = [];
  const errors = [];

  for (const conversation of recent) {
    let body;
    try {
      body = await ghlGet(`/conversations/${conversation.id}/messages?limit=50`);
    } catch (error) {
      errors.push({
        conversationId: conversation.id,
        contactId: conversation.contactId || null,
        error: String(error?.message || error).slice(0, 500),
      });
      continue;
    }

    for (const message of body.messages?.messages || []) {
      const messageBody = String(message.body || "");
      const messageTime = Date.parse(message.dateAdded || "");
      if (messageTime < since || !/Your appointment has been confirmed/i.test(messageBody)) continue;
      const blankTime =
        /Date:\s*(?:\n|$)|Start Time:\s*(?:\n|$)|End Time:\s*(?:\n|$)/i.test(messageBody);
      confirmations.push({
        conversationId: conversation.id,
        contactId: message.contactId || conversation.contactId,
        messageId: message.id,
        date: message.dateAdded,
        direction: message.direction,
        status: message.status || null,
        type: message.messageType || message.type,
        source: message.source,
        to: message.to || null,
        blankTime,
        error: message.error || null,
      });
    }
  }

  confirmations.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return { confirmations, errors };
}

async function checkLocationSettings() {
  const location = (await ghlGet(`/locations/${locationId}`)).location || {};
  return {
    name: location.name || null,
    email: location.email || null,
    phone: location.phone || null,
    allowDuplicateContact: location.settings?.allowDuplicateContact ?? null,
    allowDuplicateOpportunity: location.settings?.allowDuplicateOpportunity ?? null,
  };
}

function summarize(report) {
  const issues = [];
  if (report.website.status !== 200) issues.push(`Live services page returned ${report.website.status}`);
  for (const [marker, count] of Object.entries(report.website.markers || {})) {
    if (count === 0) issues.push(`Live bundle missing marker: ${marker}`);
  }
  if (report.website.preflight?.skipped) issues.push(`Live preflight skipped: ${report.website.preflight.skipped}`);
  if (!report.dns.mgMx.length) issues.push("mg.homegrownvisualsmedia.com MX records are missing");
  if (report.dns.rootMx.some((record) => /mailgun/i.test(record.exchange || ""))) {
    issues.push("Root domain MX points to Mailgun; verify this is intentional for real inbox routing");
  }
  if (report.locationSettings?.allowDuplicateOpportunity) {
    issues.push("GHL location allows duplicate opportunities; duplicate-opportunity guard must stay active");
  }
  for (const issue of report.criticalWorkflows?.issues || []) issues.push(issue);
  for (const issue of report.calendarRouting?.issues || []) issues.push(issue);
  for (const booking of report.futureBookings) {
    for (const risk of booking.risks) issues.push(`${booking.contact.name || booking.contact.email}: ${risk}`);
  }
  for (const message of report.recentConfirmations) {
    if (message.blankTime) issues.push(`Blank date/time confirmation message: ${message.contactId} ${message.messageId}`);
    if (message.status === "undelivered") issues.push(`Undelivered confirmation ${message.type}: ${message.error || message.contactId}`);
  }
  if (report.recentConfirmationErrors?.length) {
    issues.push(`GHL conversation audit skipped ${report.recentConfirmationErrors.length} conversation(s) due to GHL API errors`);
  }
  return issues;
}

function flattenTxt(records) {
  return records.map((record) => record.join("")).join("; ") || "missing";
}

function formatMx(records) {
  return records.map((record) => `${record.priority} ${record.exchange}`).join(", ") || "missing";
}

function renderMarkdown(report, jsonPath) {
  const lines = [
    "# Homegrown Visuals Health Check",
    "",
    `Generated: ${report.generatedAt}`,
    `Live URL: ${report.liveUrl}`,
    `Location ID: ${report.locationId}`,
    `JSON evidence: ${jsonPath}`,
    "",
    "## Status",
    "",
    `- Live services page: ${report.website.status}`,
    `- Live bundle asset: ${report.website.asset || "missing"}`,
    `- Production preflight: ${
      report.website.preflight?.skipped
        ? `skipped (${report.website.preflight.skipped})`
        : report.website.preflight?.dryRun
          ? "configured (dry-run validation passed)"
        : report.website.preflight?.error === "Missing contact email or phone"
          ? "configured (validation reached)"
        : report.website.preflight?.ok
          ? "active"
          : JSON.stringify(report.website.preflight)
    }`,
    `- GHL duplicate opportunities allowed: ${report.locationSettings?.allowDuplicateOpportunity ?? "unknown"}`,
    `- Website calendar routes checked: ${report.calendarRouting?.checked?.length ?? 0}`,
    `- Critical workflows checked: ${report.criticalWorkflows?.checked?.length ?? 0}`,
    `- Future appointments checked: ${report.futureBookings.length}`,
    `- Recent confirmation messages checked: ${report.recentConfirmations.length}`,
    `- Recent conversation fetch errors: ${report.recentConfirmationErrors?.length ?? 0}`,
    "",
    "## Issues",
    "",
  ];

  if (report.issues.length) {
    for (const issue of report.issues) lines.push(`- ${issue}`);
  } else {
    lines.push("- None detected.");
  }

  lines.push("", "## Live Bundle Markers", "");
  for (const [marker, count] of Object.entries(report.website.markers || {})) {
    lines.push(`- ${marker}: ${count}`);
  }

  lines.push("", "## Future Bookings", "");
  if (report.futureBookings.length) {
    for (const booking of report.futureBookings) {
      lines.push(
        `- ${booking.contact.name || booking.contact.email || booking.contact.id}: ${booking.event.start} | ${booking.event.status} | ${
          booking.currentOpportunity?.stage || "no opportunity"
        } | risks: ${booking.risks.length ? booking.risks.join("; ") : "none"}`,
      );
    }
  } else {
    lines.push("- None found.");
  }

  lines.push("", "## Website Calendar Routing", "");
  if (report.calendarRouting?.checked?.length) {
    for (const row of report.calendarRouting.checked) {
      lines.push(`- ${row.expected}: ${row.name || row.id} (${row.selectedUserCount} selected user${row.selectedUserCount === 1 ? "" : "s"})`);
    }
  } else {
    lines.push("- Not checked.");
  }

  lines.push("", "## Critical Workflows", "");
  if (report.criticalWorkflows?.checked?.length) {
    for (const workflow of report.criticalWorkflows.checked) {
      lines.push(
        `- ${workflow.expectedName}: ${workflow.status} | version ${workflow.version ?? "unknown"} | updated ${workflow.updatedAt || "unknown"}`,
      );
    }
  } else {
    lines.push("- Not checked.");
  }

  const messageProblems = report.recentConfirmations.filter(
    (message) => message.blankTime || message.status === "undelivered",
  );
  lines.push("", "## Confirmation Message Problems", "");
  if (messageProblems.length) {
    for (const message of messageProblems) {
      lines.push(
        `- ${message.date} ${message.type} contact=${message.contactId} message=${message.messageId}: ${
          message.blankTime ? "blank date/time" : message.error || message.status
        }`,
      );
    }
  } else {
    lines.push("- None found.");
  }

  lines.push("", "## Conversation Audit Fetch Errors", "");
  if (report.recentConfirmationErrors?.length) {
    for (const error of report.recentConfirmationErrors) {
      lines.push(`- conversation=${error.conversationId} contact=${error.contactId || "unknown"}: ${error.error}`);
    }
  } else {
    lines.push("- None found.");
  }

  lines.push("", "## DNS", "");
  lines.push(`- mg SPF: ${flattenTxt(report.dns.mgSpf)}`);
  lines.push(`- mg DKIM: ${report.dns.mgDkim.length ? "present" : "missing"}`);
  lines.push(`- mg MX: ${formatMx(report.dns.mgMx)}`);
  lines.push(`- root MX: ${formatMx(report.dns.rootMx)}`);
  lines.push(`- root DMARC: ${flattenTxt(report.dns.rootDmarc)}`);

  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    liveUrl,
    locationId,
    website: await checkWebsite(),
    dns: await checkDns(),
    locationSettings: null,
    criticalWorkflows: null,
    calendarRouting: null,
    futureBookings: [],
    recentConfirmations: [],
    recentConfirmationErrors: [],
    issues: [],
  };

  if (ghlToken) {
    report.locationSettings = await checkLocationSettings();
    report.criticalWorkflows = checkCriticalWorkflows(await getWorkflows());
    const calendars = await getCalendars();
    report.calendarRouting = checkCalendarRouting(calendars);
    report.futureBookings = await checkFutureBookings(calendars);
    const recentConfirmationCheck = await checkRecentConfirmations();
    report.recentConfirmations = recentConfirmationCheck.confirmations;
    report.recentConfirmationErrors = recentConfirmationCheck.errors;
  } else {
    report.issues.push("Missing GHL token locally; skipped GHL checks");
  }

  report.issues.push(...summarize(report));
  mkdirSync(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = join(outputDir, `homegrown-health-check-${stamp}.json`);
  const markdownPath = join(outputDir, `homegrown-health-check-${stamp}.md`);
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownPath, renderMarkdown(report, outputPath));

  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    outputPath,
    markdownPath,
    issueCount: report.issues.length,
    issues: report.issues,
  }, null, 2));

  if (process.env.HGV_AUDIT_STRICT === "1" && report.issues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
