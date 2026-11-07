// Shared browser helpers for website forms that land in GHL through our own
// API routes (/api/hgv-inquiry, /api/hgv-email-list).

export const createIntakeId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `intake-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

export async function postIntake(url: string, body: Record<string, unknown>) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    return response.ok && result?.ok === true;
  } catch {
    return false;
  }
}
