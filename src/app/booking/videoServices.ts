// Dean is the only photographer booked for video. One video item makes the
// whole booking Dean-only, so these services never reach a shared calendar.
export const VIDEO_SERVICE_IDS = new Set<string>([
  "luxury",
  "re_luxury_base",
  "re_luxury_area",
  "re_luxury_ai",
  "re_luxury_day_night",
  "re_sm_1",
  "re_sm_1_ai",
  "re_sm_2",
  "re_sm_3",
  "re_sm_5",
  "re_cinematic_video",
  "re_walkthrough_60",
  "re_highlight_30",
  "re_highlight_30_ai",
  "re_drone_video_30",
  "re_drone_clip_1",
  "re_drone_clip_2",
  "re_drone_clip_3",
  "re_drone_clip_4",
  "re_drone_clip_5",
  "land_package",
]);

export const requiresDean = (serviceIds: string[]) =>
  serviceIds.some((serviceId) => VIDEO_SERVICE_IDS.has(serviceId));
