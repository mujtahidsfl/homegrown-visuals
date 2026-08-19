export async function submitGhlBookingPreflight(payload: Record<string, unknown>) {
  try {
    const response = await fetch("/api/hgv-booking-preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`GHL preflight skipped after status ${response.status}`);
    }
  } catch {
    console.warn("GHL preflight skipped after request failure");
  }
}
