export type BookingSubmissionMode = "make" | "orchestrator";

export const BOOKING_SUBMISSION_MODE: BookingSubmissionMode =
  import.meta.env.VITE_HGV_BOOKING_SUBMISSION_MODE === "orchestrator"
    ? "orchestrator"
    : "make";

export const usesBookingOrchestrator = BOOKING_SUBMISSION_MODE === "orchestrator";

export const packageServicesRoute = (packageKey: string) =>
  `/services?service=real-estate&package=${encodeURIComponent(packageKey)}`;
