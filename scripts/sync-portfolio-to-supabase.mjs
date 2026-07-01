import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const portfolioRoot = path.join(projectRoot, "src", "assets", "portfolio");
const envPath = path.join(projectRoot, ".env.local");

async function loadEnvFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function fileStem(filePath) {
  return decodeURIComponent(path.basename(filePath).replace(/\.[^/.]+$/, ""));
}

function comparePaths(a, b) {
  return fileStem(a).localeCompare(fileStem(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function sanitizeId(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function guessMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

const LOCAL_CATEGORY_CONFIG = {
  exterior: {
    titlePrefix: "Exterior Photo",
    service: "Exterior Photos",
    category: "Exterior Photos",
    description: "Exterior imagery focused on curb appeal, lot context, and listing-first first impressions.",
    mediaType: "image",
  },
  "architectural-detail": {
    titlePrefix: "Architectural Detail",
    service: "Architectural/Detail Photos",
    category: "Architectural/Detail Photos",
    description: "Architectural composition highlighting structure, materials, and premium design details.",
    mediaType: "image",
  },
  interior: {
    titlePrefix: "Interior Photo",
    service: "Interior Photos",
    category: "Interior Photos",
    description: "Interior photo capturing layout, natural light, and high-impact room presentation.",
    mediaType: "image",
    excludeFiles: new Set(["014.jpg"]),
  },
  "natural-twilight": {
    titlePrefix: "Natural Twilight",
    service: "Exterior Photos",
    category: "Exterior Photos",
    description: "Natural twilight capture featuring ambient dusk light and warm interior glow for stronger listing appeal.",
    mediaType: "image",
  },
  "virtual-twilight": {
    titlePrefix: "Virtual Twilight",
    service: "Exterior Photos",
    category: "Exterior Photos",
    description: "Virtual twilight enhancement that transforms daytime captures into premium dusk-ready listing visuals.",
    mediaType: "image",
  },
  "ai-reels": {
    titlePrefix: "AI Reel",
    service: "AI Reels",
    category: "AI Reels",
    description: "AI-powered reel content built for social reach, engagement, and faster listing attention.",
    mediaType: "video",
  },
  "luxury-reels": {
    titlePrefix: "Luxury Reel",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
    mediaType: "video",
  },
};

const externalItems = [
  {
    id: "cinematic-vimeo-01",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1183818261?fl=tl&fe=ec",
    thumbnailUrl: "https://vumbnail.com/1183818261.jpg",
    title: "Cinematic Reel 01",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-02",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1183817042?fl=tl&fe=ec",
    thumbnailUrl: "https://vumbnail.com/1183817042.jpg",
    title: "Cinematic Reel 02",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-03",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1183815766?fl=tl&fe=ec",
    thumbnailUrl: "https://vumbnail.com/1183815766.jpg",
    title: "Cinematic Reel 03",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-04",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1183879201?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1183879201.jpg",
    title: "Cinematic Reel 04",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-05",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1183879791?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1183879791.jpg",
    title: "Cinematic Reel 05",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-01",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184083156?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184083156.jpg",
    title: "Luxury Reel 15",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-02",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184083154?fl=tl&fe=ec",
    thumbnailUrl: "https://vumbnail.com/1184083154.jpg",
    title: "Luxury Reel 16",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-03",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184083928?fl=tl&fe=ec",
    thumbnailUrl: "https://vumbnail.com/1184083928.jpg",
    title: "Luxury Reel 17",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-04",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088350?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088350.jpg",
    title: "Luxury Reel 18",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-05",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088354?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088354.jpg",
    title: "Luxury Reel 19",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-06",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088439?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088439.jpg",
    title: "Luxury Reel 20",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-07",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088347?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088347.jpg",
    title: "Luxury Reel 21",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-08",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088691?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088691.jpg",
    title: "Luxury Reel 22",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-09",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088352?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088352.jpg",
    title: "Luxury Reel 23",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-10",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184088997?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184088997.jpg",
    title: "Luxury Reel 24",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-reel-dropbox-01",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AH-9-njzhCTI4fN4YdOcDuc/luxury%20reels/10220%20N%20Loop%20Rd%20Video%20V2%20-%204K.mov?raw=1",
    title: "Luxury Reel 01",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-02",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AMbe9C0IqELpgFWP0mpSNhQ/luxury%20reels/1152%20Ceylon%20Ct%20V2.mp4?raw=1",
    title: "Luxury Reel 02",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-03",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AESno0TCvpVWgOeFjfGPFbw/luxury%20reels/1929%20Jessica%20Way.mp4?raw=1",
    title: "Luxury Reel 03",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-04",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AASuQDuE_RJ8J7h_PBojDOU/luxury%20reels/5528%20Heatherton%20Rd%20V2.mp4?raw=1",
    title: "Luxury Reel 04",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-05",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AGrzVyEeJh98bRhuLrM7X3w/luxury%20reels/8073%20Thoroughbred%20Rd%2C%20Pensacola%2C%20FL%2032526.mp4?raw=1",
    title: "Luxury Reel 05",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-06",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ADceMRTbJJbIELJVCKSe6Bk/luxury%20reels/8577%20Gulf%20Blvd%2C%20Apt%20105%2C%20Navarre%2C%20FL%2032566%20(1).mp4?raw=1",
    title: "Luxury Reel 06",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-07",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AO_-vxxw-vkH8Xp0VosOAfg/luxury%20reels/9123%20Sage%20Forest%20Ln_rev%201.mp4?raw=1",
    title: "Luxury Reel 07",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-08",
    mediaType: "external",
    sourceKind: "dropbox",
    sourceUrl: "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ALHR5d9SgwKkEL9EI9PQF8M/luxury%20reels/Blue%20Shadows.mp4?raw=1",
    title: "Luxury Reel 08",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "social-ad-vimeo-01",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184070790?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184070790.jpg",
    title: "Social Media Ad 01",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-02",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184070994?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184070994.jpg",
    title: "Social Media Ad 02",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-03",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184071329?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184071329.jpg",
    title: "Social Media Ad 03",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-04",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184071406?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184071406.jpg",
    title: "Social Media Ad 04",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-05",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184071486?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184071486.jpg",
    title: "Social Media Ad 05",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-06",
    mediaType: "external",
    sourceKind: "vimeo",
    sourceUrl: "https://vimeo.com/1184071625?share=copy&fl=sv&fe=ci",
    thumbnailUrl: "https://vumbnail.com/1184071625.jpg",
    title: "Social Media Ad 06",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
];

async function ensureBucket({ supabaseUrl, serviceRoleKey, bucket }) {
  const getResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (getResponse.ok) {
    return;
  }
  const text = await getResponse.text();
  const isMissingBucket =
    getResponse.status === 404 ||
    /bucket not found/i.test(text) ||
    /not found/i.test(text);

  if (!isMissingBucket) {
    throw new Error(`Failed to inspect bucket ${bucket}: ${text}`);
  }

  const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: false,
    }),
  });

  if (!createResponse.ok) {
    const text = await createResponse.text();
    throw new Error(`Failed to create bucket ${bucket}: ${text}`);
  }
}

async function uploadToStorage({ supabaseUrl, serviceRoleKey, bucket, storagePath, filePath, body, contentType }) {
  const payload = body ?? (await fs.readFile(filePath));
  const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "x-upsert": "true",
      "Content-Type": contentType ?? guessMimeType(filePath),
    },
    body: payload,
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    throw new Error(`Failed to upload ${storagePath}: ${text}`);
  }
}

async function readLocalPortfolioItems() {
  const entries = await fs.readdir(portfolioRoot, { withFileTypes: true });
  const localItems = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const config = LOCAL_CATEGORY_CONFIG[entry.name];
    if (!config) continue;

    const categoryDir = path.join(portfolioRoot, entry.name);
    const files = (await fs.readdir(categoryDir))
      .filter((fileName) => /\.(jpg|jpeg|png|webp|mp4|mov)$/i.test(fileName))
      .filter((fileName) => !config.excludeFiles?.has(fileName))
      .sort(comparePaths);

    files.forEach((fileName, index) => {
      const relPath = path.join(entry.name, fileName);
      localItems.push({
        id: `local-${sanitizeId(relPath)}`,
        title: `${config.titlePrefix} ${String(index + 1).padStart(2, "0")}`,
        location: "Gulf Coast",
        service: config.service,
        category: config.category,
        description: config.description,
        mediaType: config.mediaType,
        sourceKind: "local_asset",
        sourceUrl: relPath.replace(/\\/g, "/"),
        filePath: path.join(categoryDir, fileName),
        storagePath: path.posix.join("portfolio", entry.name, fileName),
      });
    });
  }

  return localItems;
}

function buildMetadataRows(localItems) {
  const combined = [...localItems, ...externalItems];

  return combined.map((item, index) => ({
    id: item.id,
    title: item.title,
    location: item.location,
    service: item.service,
    category: item.category,
    description: item.description,
    media_type: item.mediaType,
    source_kind: item.sourceKind,
    source_url: item.sourceUrl,
    backup_storage_path: item.storagePath ?? null,
    thumbnail_url: item.thumbnailUrl ?? null,
    sort_order: index + 1,
    is_active: true,
    metadata: {
      backup_only: true,
      region: process.env.SUPABASE_REGION ?? null,
    },
  }));
}

async function upsertPortfolioRows({ supabaseUrl, serviceRoleKey, rows }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/portfolio_items?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (response.ok) {
    return { success: true };
  }

  const text = await response.text();
  return { success: false, error: text };
}

async function main() {
  await loadEnvFile(envPath);

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.SUPABASE_PORTFOLIO_BUCKET || "portfolio-backups";

  await ensureBucket({ supabaseUrl, serviceRoleKey, bucket });

  const localItems = await readLocalPortfolioItems();
  const uploadedLocalItems = [];
  const skippedLocalItems = [];

  for (const [index, item] of localItems.entries()) {
    try {
      console.log(`[${index + 1}/${localItems.length}] Uploading ${item.storagePath}`);
      await uploadToStorage({
        supabaseUrl,
        serviceRoleKey,
        bucket,
        storagePath: item.storagePath,
        filePath: item.filePath,
      });
      uploadedLocalItems.push(item);
      console.log(`[${index + 1}/${localItems.length}] Uploaded ${item.storagePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/payload too large/i.test(message)) {
        skippedLocalItems.push({
          ...item,
          backupStatus: "metadata_only_payload_too_large",
        });
        console.log(`[${index + 1}/${localItems.length}] Metadata-only backup for ${item.storagePath} (payload too large)`);
        continue;
      }
      throw error;
    }
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    bucket,
    counts: {
      local_assets_total: localItems.length,
      local_assets_uploaded: uploadedLocalItems.length,
      local_assets_metadata_only: skippedLocalItems.length,
      external_metadata: externalItems.length,
      total_records: localItems.length + externalItems.length,
    },
    local_assets: uploadedLocalItems.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      service: item.service,
      media_type: item.mediaType,
      source_url: item.sourceUrl,
      storage_path: item.storagePath,
    })),
    local_assets_metadata_only: skippedLocalItems.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      service: item.service,
      media_type: item.mediaType,
      source_url: item.sourceUrl,
      storage_path: item.storagePath,
      backup_status: item.backupStatus,
    })),
    external_items: externalItems,
  };

  await uploadToStorage({
    supabaseUrl,
    serviceRoleKey,
    bucket,
    storagePath: "manifests/portfolio-manifest.json",
    body: Buffer.from(JSON.stringify(manifest, null, 2), "utf8"),
    contentType: "application/json",
  });

  const metadataRows = buildMetadataRows(localItems);
  const upsertResult = await upsertPortfolioRows({
    supabaseUrl,
    serviceRoleKey,
    rows: metadataRows,
  });

  console.log(`Uploaded ${uploadedLocalItems.length} local portfolio assets to bucket "${bucket}".`);
  if (skippedLocalItems.length) {
    console.log(`Stored metadata-only backup entries for ${skippedLocalItems.length} oversized local files.`);
  }
  console.log(`Uploaded manifest with ${manifest.counts.total_records} portfolio records.`);

  if (upsertResult.success) {
    console.log(`Upserted ${metadataRows.length} rows into public.portfolio_items.`);
  } else {
    console.warn("Storage backup succeeded, but portfolio_items table upsert did not run.");
    console.warn("Run supabase/portfolio_items_schema.sql in the Supabase SQL editor, then rerun this script.");
    console.warn(upsertResult.error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
