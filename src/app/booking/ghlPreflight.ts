export async function submitGhlBookingPreflight(payload: Record<string, unknown>) {
  const response = await fetch("/api/hgv-booking-preflight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`GHL preflight failed with status ${response.status}`);
  }
}
