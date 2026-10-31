import assert from "node:assert/strict";
import { VIDEO_SERVICE_IDS, requiresDean } from "../src/app/booking/videoServices.ts";

const videoServices = [
  "luxury",
  "re_luxury_base", "re_luxury_area", "re_luxury_ai", "re_luxury_day_night",
  "re_sm_1", "re_sm_1_ai", "re_sm_2", "re_sm_3", "re_sm_5",
  "re_cinematic_video", "re_walkthrough_60",
  "re_highlight_30", "re_highlight_30_ai",
  "re_drone_video_30",
  "re_drone_clip_1", "re_drone_clip_2", "re_drone_clip_3", "re_drone_clip_4", "re_drone_clip_5",
  "land_package",
];
for (const id of videoServices) assert.equal(requiresDean([id]), true, `${id} must be Dean-only`);
assert.equal(VIDEO_SERVICE_IDS.size, videoServices.length);

for (const id of ["standard", "zillow_showcase", "re_listing_photos", "re_zillow_3d", "re_drone_6", "re_drone_12",
  "re_twilight_1", "re_stage_1", "re_detail_5", "re_landmark_1", "re_amenity_photos", "land_photos_12", "land_photos_20"]) {
  assert.equal(requiresDean([id]), false, `${id} must stay available to other photographers`);
}
assert.equal(requiresDean([]), false);
assert.equal(requiresDean(["standard", "re_drone_6", "re_cinematic_video"]), true, "one video item makes the whole booking Dean-only");
console.log("Dean-only video routing checks passed");
