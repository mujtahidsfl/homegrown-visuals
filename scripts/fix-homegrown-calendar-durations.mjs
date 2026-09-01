import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE_URL = "https://services.leadconnectorhq.com";
const APPLY_CONFIRMATION = "APPLY_HOMEGROWN_CALENDAR_DURATIONS";
const ROLLBACK_CONFIRMATION = "ROLLBACK_HOMEGROWN_CALENDAR_DURATIONS";

const calendars = [
  ["2ShQm1bADqe7dru4aYBx", 30, "Dean"],
  ["XUbE5uf8Im9c5746ZRus", 60, "Dean"],
  ["nnnA7kmkDvcnUp6JMo32", 90, "Dean"],
  ["D2pCJAgDLylzfXFCzkxH", 120, "Dean"],
  ["4ZtW10x59FIwBD4UJPeM", 150, "Dean"],
  ["V6J170tMMqltADDAZYbZ", 180, "Dean"],
  ["DonrOjglvoeIgsmcdnZr", 240, "Dean"],
  ["S4BQEQC3FSVIZveHVxrP", 300, "Dean"],
  ["etyEO3oacR7QrE0sMcyX", 360, "Dean"],
  ["soYosjYfHO0sA0QAcSFx", 30, "Dean + Brayden"],
  ["oTcmJ62JHyAeqAbL5in3", 60, "Dean + Brayden"],
  ["z3Z206M8bu6mu73WS2Az", 90, "Dean + Brayden"],
  ["8rsj2UGk2h7YI1Nfm1Ct", 120, "Dean + Brayden"],
  ["EK6ts0AJGfKWXKQy8oEX", 150, "Dean + Brayden"],
  ["QuU72RBp3THvTfucylPa", 180, "Dean + Brayden"],
  ["ha4qGeTnDdhEIS2RdYGw", 240, "Dean + Brayden"],
  ["0G4ghLpXimxHzk9LRyxg", 300, "Dean + Brayden"],
  ["eS4f0kYLJRRpBNbeqNz2", 360, "Dean + Brayden"],
].map(([id, expectedDuration, assignment]) => ({ id, expectedDuration, assignment }));

const token = process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;
if (!token) throw new Error("Missing GHL token");

async function request(calendarId, { method = "GET", body } = {}) {
  const response = await fetch(`${BASE_URL}/calendars/${calendarId}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "v3",
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { message: text.slice(0, 300) };
  }
  if (!response.ok) {
    throw new Error(parsed.message || parsed.error || `Calendar request failed with status ${response.status}`);
  }
  return parsed.calendar || parsed;
}

function snapshot(calendar, expected) {
  return {
    id: calendar.id,
    name: calendar.name,
    assignment: expected.assignment,
    expectedDuration: expected.expectedDuration,
    slotDuration: calendar.slotDuration,
    slotDurationUnit: calendar.slotDurationUnit,
    slotInterval: calendar.slotInterval,
    slotIntervalUnit: calendar.slotIntervalUnit,
    selectedUserIds: (calendar.teamMembers || [])
      .filter((member) => member.selected !== false)
      .map((member) => member.userId),
  };
}

async function updateAndVerify(entry, duration, unit) {
  await request(entry.id, {
    method: "PUT",
    body: { slotDuration: duration, slotDurationUnit: unit || "mins" },
  });
  const verified = await request(entry.id);
  if (Number(verified.slotDuration) !== Number(duration) || verified.slotDurationUnit !== (unit || "mins")) {
    throw new Error(`Calendar ${entry.id} did not retain the requested duration`);
  }
  return verified;
}

async function rollback(file) {
  if (process.env.HGV_CALENDAR_FIX_CONFIRM !== ROLLBACK_CONFIRMATION) {
    throw new Error(`Refusing rollback: set HGV_CALENDAR_FIX_CONFIRM=${ROLLBACK_CONFIRMATION}`);
  }
  const backup = JSON.parse(readFileSync(resolve(file), "utf8"));
  for (const entry of backup.calendars || []) {
    await updateAndVerify(entry, entry.slotDuration, entry.slotDurationUnit);
  }
  console.log(JSON.stringify({ ok: true, mode: "rollback", restored: backup.calendars.length }, null, 2));
}

async function main() {
  const rollbackFile = process.env.HGV_CALENDAR_FIX_ROLLBACK_FILE;
  if (rollbackFile) return rollback(rollbackFile);

  const current = [];
  for (const expected of calendars) {
    current.push(snapshot(await request(expected.id), expected));
  }
  const changes = current.filter((entry) => Number(entry.slotDuration) !== entry.expectedDuration);
  const dryRun = process.env.HGV_CALENDAR_FIX_CONFIRM !== APPLY_CONFIRMATION;
  if (dryRun) {
    console.log(JSON.stringify({ ok: true, mode: "dry_run", calendarCount: current.length, changeCount: changes.length, changes }, null, 2));
    return;
  }

  const backupPath = resolve(
    process.env.HGV_CALENDAR_FIX_BACKUP_PATH ||
      `../outputs/homegrown-calendar-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  mkdirSync(dirname(backupPath), { recursive: true });
  writeFileSync(backupPath, `${JSON.stringify({ createdAt: new Date().toISOString(), calendars: current }, null, 2)}\n`);

  const updated = [];
  for (const entry of changes) {
    const verified = await updateAndVerify(entry, entry.expectedDuration, "mins");
    updated.push({ id: entry.id, name: entry.name, slotDuration: verified.slotDuration });
  }
  console.log(JSON.stringify({ ok: true, mode: "apply", backupPath, updated }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
