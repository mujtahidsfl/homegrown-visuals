import { useEffect, useState } from "react";
import { ExternalLink, Filter, Play, X } from "lucide-react";
import { useLocation } from "react-router";

export type PortfolioProject = {
  id: string;
  media: string;
  mediaType: "image" | "video" | "external";
  thumbnail?: string;
  title: string;
  location: string;
  service: string;
  category: string;
  description: string;
  hoverTag?: string;
};

const architecturalImages = import.meta.glob("../../assets/portfolio/architectural-detail/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const exteriorImages = import.meta.glob("../../assets/portfolio/exterior/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const interiorImages = Object.fromEntries(
  Object.entries(
    import.meta.glob("../../assets/portfolio/interior/*.{jpg,jpeg,png,webp}", {
      eager: true,
      import: "default",
    }) as Record<string, string>,
  ).filter(([path]) => !path.endsWith("/014.jpg")),
) as Record<string, string>;

const naturalTwilightImages = import.meta.glob("../../assets/portfolio/natural-twilight/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const virtualTwilightImages = import.meta.glob("../../assets/portfolio/virtual-twilight/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const luxuryReelVideos = import.meta.glob("../../assets/portfolio/luxury-reels/*.{mp4,MP4,mov,MOV}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function fileStem(path: string): string {
  return decodeURIComponent(path.split("/").pop()?.replace(/\.[^/.]+$/, "") ?? "");
}

function sortImageEntries(images: Record<string, string>): Array<[string, string]> {
  return Object.entries(images).sort((a, b) =>
    fileStem(a[0]).localeCompare(fileStem(b[0]), undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function createImageProjects(
  assets: Record<string, string>,
  idPrefix: string,
  titlePrefix: string,
  service: string,
  category: string,
  description: string,
  hoverTag?: string,
): PortfolioProject[] {
  return sortImageEntries(assets).map(([, media], index) => ({
    id: `${idPrefix}-${String(index + 1).padStart(2, "0")}`,
    media,
    mediaType: "image",
    title: `${titlePrefix} ${String(index + 1).padStart(2, "0")}`,
    location: "Gulf Coast",
    service,
    category,
    description,
    hoverTag,
  }));
}

function createVideoProjects(
  assets: Record<string, string>,
  idPrefix: string,
  titlePrefix: string,
  service: string,
  category: string,
  description: string,
): PortfolioProject[] {
  return sortImageEntries(assets).map(([, media], index) => ({
    id: `${idPrefix}-${String(index + 1).padStart(2, "0")}`,
    media,
    mediaType: "video",
    title: `${titlePrefix} ${String(index + 1).padStart(2, "0")}`,
    location: "Gulf Coast",
    service,
    category,
    description,
  }));
}

function getVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? "";
}

function getVimeoEmbedUrl(url: string): string {
  const id = getVimeoId(url);
  return id
    ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&autoplay=1`
    : url;
}

function getVimeoThumbnail(url: string): string {
  const id = getVimeoId(url);
  return id ? `https://vumbnail.com/${id}.jpg` : "";
}

function getVimeoThumbnailSources(url: string): string[] {
  const id = getVimeoId(url);

  return id
    ? [
        `https://vumbnail.com/${id}_extra_large.jpg`,
        `https://vumbnail.com/${id}_large.jpg`,
        `https://vumbnail.com/${id}_medium.jpg`,
        `https://vumbnail.com/${id}.jpg`,
      ]
    : [];
}

const exteriorProjects = createImageProjects(
  exteriorImages,
  "exterior",
  "Exterior Photo",
  "Exterior Photos",
  "Exterior Photos",
  "Exterior imagery focused on curb appeal, lot context, and listing-first first impressions.",
);

const architecturalProjects = createImageProjects(
  architecturalImages,
  "architectural",
  "Architectural Detail",
  "Architectural/Detail Photos",
  "Architectural/Detail Photos",
  "Architectural composition highlighting structure, materials, and premium design details.",
).slice(1);

const interiorProjects = createImageProjects(
  interiorImages,
  "interior",
  "Interior Photo",
  "Interior Photos",
  "Interior Photos",
  "Interior photo capturing layout, natural light, and high-impact room presentation.",
);

const naturalTwilightProjects = createImageProjects(
  naturalTwilightImages,
  "natural-twilight",
  "Natural Twilight",
  "Exterior Photos",
  "Exterior Photos",
  "Natural twilight capture featuring ambient dusk light and warm interior glow for stronger listing appeal.",
  "natural twilight",
);

const virtualTwilightProjects = createImageProjects(
  virtualTwilightImages,
  "virtual-twilight",
  "Virtual Twilight",
  "Exterior Photos",
  "Exterior Photos",
  "Virtual twilight enhancement that transforms daytime captures into premium dusk-ready listing visuals.",
  "virtual twilight",
);

const luxuryReelProjects = createVideoProjects(
  luxuryReelVideos,
  "luxury-reel",
  "Luxury Reel",
  "Luxury Agent Reels",
  "Luxury Agent Reels",
  "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
);

const luxuryReelDropboxProjects: PortfolioProject[] = [
  {
    id: "luxury-reel-dropbox-01",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AH-9-njzhCTI4fN4YdOcDuc/luxury%20reels/10220%20N%20Loop%20Rd%20Video%20V2%20-%204K.mov?raw=1",
    mediaType: "video",
    title: "Luxury Reel 01",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-02",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AMbe9C0IqELpgFWP0mpSNhQ/luxury%20reels/1152%20Ceylon%20Ct%20V2.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 02",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-03",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AESno0TCvpVWgOeFjfGPFbw/luxury%20reels/1929%20Jessica%20Way.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 03",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-04",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AASuQDuE_RJ8J7h_PBojDOU/luxury%20reels/5528%20Heatherton%20Rd%20V2.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 04",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-05",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AGrzVyEeJh98bRhuLrM7X3w/luxury%20reels/8073%20Thoroughbred%20Rd%2C%20Pensacola%2C%20FL%2032526.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 05",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-06",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ADceMRTbJJbIELJVCKSe6Bk/luxury%20reels/8577%20Gulf%20Blvd%2C%20Apt%20105%2C%20Navarre%2C%20FL%2032566%20(1).mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 06",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-07",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AO_-vxxw-vkH8Xp0VosOAfg/luxury%20reels/9123%20Sage%20Forest%20Ln_rev%201.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 07",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-08",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ALHR5d9SgwKkEL9EI9PQF8M/luxury%20reels/Blue%20Shadows.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 08",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-09",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ADwqPOB6KfTFUDJSAU5LnnU/luxury%20reels/Bradfield%20video.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 09",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-10",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ABxvTMsodk_P6BAYWCQkid0/luxury%20reels/Brittany%20Place.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 10",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-11",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ALQh_dfxUg2Ttw5kkqXsvMw/luxury%20reels/copy_55C83EBF-B062-43D1-8BE9-BCA23CF3603A.MOV?raw=1",
    mediaType: "video",
    title: "Luxury Reel 11",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-12",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ABsIi58pw9IVc3vdozoxJWM/luxury%20reels/Denzel%20Siri%20Ad%20-%20FINAL.mov?raw=1",
    mediaType: "video",
    title: "Luxury Reel 12",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-13",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/AHOFsDoHzXPbPpzu2nFYDMw/luxury%20reels/Portofino%20final.mp4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 13",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
  {
    id: "luxury-reel-dropbox-14",
    media:
      "https://www.dropbox.com/scl/fo/0gbwbgbsdbqzvidln20gt/ANCVR_FsZbwuVoDx6iPfOx0/luxury%20reels/Soundview%20Trail%E2%81%84agent.MP4?raw=1",
    mediaType: "video",
    title: "Luxury Reel 14",
    location: "Gulf Coast",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Luxury listing reels designed to elevate agent presence and showcase premium properties with cinematic polish.",
  },
];

const cinematicVideoProjects: PortfolioProject[] = [
  {
    id: "cinematic-vimeo-01",
    media: "https://vimeo.com/1183818261?fl=tl&fe=ec",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1183818261?fl=tl&fe=ec"),
    title: "Cinematic Reel 01",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-02",
    media: "https://vimeo.com/1183817042?fl=tl&fe=ec",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1183817042?fl=tl&fe=ec"),
    title: "Cinematic Reel 02",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-03",
    media: "https://vimeo.com/1183815766?fl=tl&fe=ec",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1183815766?fl=tl&fe=ec"),
    title: "Cinematic Reel 03",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-04",
    media: "https://vimeo.com/1183879201?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1183879201?share=copy&fl=sv&fe=ci"),
    title: "Cinematic Reel 04",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
  {
    id: "cinematic-vimeo-05",
    media: "https://vimeo.com/1183879791?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1183879791?share=copy&fl=sv&fe=ci"),
    title: "Cinematic Reel 05",
    location: "Vimeo",
    service: "Cinematic Property Videos",
    category: "Cinematic Property Videos",
    description: "Watch this cinematic property reel on Vimeo.",
  },
];

const luxuryAgentProjects: PortfolioProject[] = [
  ...luxuryReelProjects,
  ...luxuryReelDropboxProjects,
].slice(0, -6);

const luxuryVimeoProjects: PortfolioProject[] = [
  {
    id: "luxury-vimeo-01",
    media: "https://vimeo.com/1184083156?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184083156?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 15",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-02",
    media: "https://vimeo.com/1184083154?fl=tl&fe=ec",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184083154?fl=tl&fe=ec"),
    title: "Luxury Reel 16",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-03",
    media: "https://vimeo.com/1184083928?fl=tl&fe=ec",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184083928?fl=tl&fe=ec"),
    title: "Luxury Reel 17",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-04",
    media: "https://vimeo.com/1184088350?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088350?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 18",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-05",
    media: "https://vimeo.com/1184088354?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088354?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 19",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-06",
    media: "https://vimeo.com/1184088439?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088439?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 20",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-07",
    media: "https://vimeo.com/1184088347?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088347?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 21",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-08",
    media: "https://vimeo.com/1184088691?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088691?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 22",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-09",
    media: "https://vimeo.com/1184088352?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088352?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 23",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
  {
    id: "luxury-vimeo-10",
    media: "https://vimeo.com/1184088997?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184088997?share=copy&fl=sv&fe=ci"),
    title: "Luxury Reel 24",
    location: "Vimeo",
    service: "Luxury Agent Reels",
    category: "Luxury Agent Reels",
    description: "Watch this luxury agent reel on Vimeo.",
  },
];

const socialMediaAdProjects: PortfolioProject[] = [
  {
    id: "social-ad-vimeo-01",
    media: "https://vimeo.com/1184070790?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184070790?share=copy&fl=sv&fe=ci"),
    title: "Social Media Ad 01",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-02",
    media: "https://vimeo.com/1184070994?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184070994?share=copy&fl=sv&fe=ci"),
    title: "Social Media Ad 02",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-03",
    media: "https://vimeo.com/1184071329?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184071329?share=copy&fl=sv&fe=ci"),
    title: "Social Media Ad 03",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-04",
    media: "https://vimeo.com/1184071406?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184071406?share=copy&fl=sv&fe=ci"),
    title: "Social Media Ad 04",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-05",
    media: "https://vimeo.com/1184071486?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184071486?share=copy&fl=sv&fe=ci"),
    title: "Social Media Ad 05",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
  {
    id: "social-ad-vimeo-06",
    media: "https://vimeo.com/1184071625?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1184071625?share=copy&fl=sv&fe=ci"),
    title: "Social Media Ad 06",
    location: "Vimeo",
    service: "Social Media Ads",
    category: "Social Media Ads",
    description: "Watch this social media ad on Vimeo.",
  },
];

const aiReelProjects: PortfolioProject[] = [
  {
    id: "ai-reel-vimeo-01",
    media: "https://vimeo.com/1185593158?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185593158?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 01",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-02",
    media: "https://vimeo.com/1185593040?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185593040?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 02",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-03",
    media: "https://vimeo.com/1185592941?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185592941?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 03",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-04",
    media: "https://vimeo.com/1185592758?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185592758?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 04",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-05",
    media: "https://vimeo.com/1185592358?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185592358?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 05",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-06",
    media: "https://vimeo.com/1185591993?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185591993?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 06",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-07",
    media: "https://vimeo.com/1185591761?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185591761?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 07",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-08",
    media: "https://vimeo.com/1185595586?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185595586?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 08",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
  {
    id: "ai-reel-vimeo-09",
    media: "https://vimeo.com/1185595716?share=copy&fl=sv&fe=ci",
    mediaType: "external",
    thumbnail: getVimeoThumbnail("https://vimeo.com/1185595716?share=copy&fl=sv&fe=ci"),
    title: "AI Reel 09",
    location: "Vimeo",
    service: "AI Reels",
    category: "AI Reels",
    description: "Watch this AI reel on Vimeo.",
  },
];

const luxuryPortfolioProjects: PortfolioProject[] = [...luxuryVimeoProjects, ...luxuryAgentProjects];

export const portfolioProjects: PortfolioProject[] = [
  ...exteriorProjects,
  ...architecturalProjects,
  ...interiorProjects,
  ...naturalTwilightProjects,
  ...virtualTwilightProjects,
  ...cinematicVideoProjects,
  ...luxuryPortfolioProjects,
  ...socialMediaAdProjects,
  ...aiReelProjects,
];

export const portfolioFilters = [
  "Exterior Photos",
  "Interior Photos",
  "Architectural/Detail Photos",
  "Cinematic Property Videos",
  "Luxury Agent Reels",
  "Social Media Ads",
  "AI Reels",
];

function getInitialVisibleCount(filter: string): number {
  return filter === "Cinematic Property Videos" ||
    filter === "Luxury Agent Reels" ||
    filter === "Social Media Ads" ||
    filter === "AI Reels"
    ? 10
    : 6;
}

export function PortfolioSection() {
  const location = useLocation();
  const [active, setActive] = useState("Exterior Photos");
  const [selectedImage, setSelectedImage] = useState<PortfolioProject | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PortfolioProject | null>(null);
  const [thumbnailAttempts, setThumbnailAttempts] = useState<Record<string, number>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [visibleByCategory, setVisibleByCategory] = useState<Record<string, number>>(
    Object.fromEntries(portfolioFilters.map((filter) => [filter, getInitialVisibleCount(filter)])),
  );

  const filtered = portfolioProjects.filter((p) => p.category === active);
  const visibleCount = visibleByCategory[active] ?? getInitialVisibleCount(active);
  const visibleProjects = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const isReelCategory =
    active === "Cinematic Property Videos" ||
    active === "Luxury Agent Reels" ||
    active === "Social Media Ads" ||
    active === "AI Reels";
  const isVerticalSelectedVideo = selectedVideo
    ? selectedVideo.category === "Cinematic Property Videos" ||
      selectedVideo.category === "Luxury Agent Reels" ||
      selectedVideo.category === "Social Media Ads" ||
      selectedVideo.category === "AI Reels"
    : false;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get("category");
    const highlightParam = searchParams.get("highlight");
    const targetProject = highlightParam ? portfolioProjects.find((project) => project.id === highlightParam) : null;
    const targetCategory = targetProject?.category ?? categoryParam;

    if (targetCategory && portfolioFilters.includes(targetCategory) && active !== targetCategory) {
      setActive(targetCategory);
    }

    if (targetProject) {
      const targetIndex = portfolioProjects
        .filter((project) => project.category === targetProject.category)
        .findIndex((project) => project.id === targetProject.id);

      setVisibleByCategory((prev) => ({
        ...prev,
        [targetProject.category]: Math.max(prev[targetProject.category] ?? getInitialVisibleCount(targetProject.category), targetIndex + 1),
      }));

      setHighlightedId(targetProject.id);
      const timer = window.setTimeout(() => {
        document.getElementById(`portfolio-${targetProject.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);

      const clearTimer = window.setTimeout(() => {
        setHighlightedId((current) => (current === targetProject.id ? null : current));
      }, 2600);

      return () => {
        window.clearTimeout(timer);
        window.clearTimeout(clearTimer);
      };
    }
  }, [location.search, active]);

  const handleFilterChange = (filter: string) => {
    setActive(filter);
    setVisibleByCategory((prev) =>
      prev[filter] ? prev : { ...prev, [filter]: getInitialVisibleCount(filter) },
    );
  };

  const handleLoadMore = () => {
    setVisibleByCategory((prev) => ({
      ...prev,
      [active]: filtered.length,
    }));
  };

  return (
    <section id="work" className="bg-white py-20 sm:py-28 px-4 sm:px-8">
      <div className="max-w-[1394px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p
            className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase mb-3"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            Our Work
          </p>
          <h2
            className="text-[#1F3A5F] text-[32px] sm:text-[40px] md:text-[44px]"
            style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Stop Blending In Start Standing Out.
          </h2>
          <p
            className="text-[#1F3A5F]/70 text-[16px] sm:text-[18px] md:text-[20px] max-w-[700px] mx-auto mt-4"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
          >
            We don't just shoot photos and videos, we create media that generates leads for your listings and grows your brand.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="md:hidden mb-8">
          <div className="rounded-[24px] bg-[#e9eaec] p-3">
            <div className="flex flex-wrap gap-2.5">
              {portfolioFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-4 py-2.5 rounded-[16px] text-[13px] leading-none whitespace-nowrap transition-colors ${
                    active === f
                      ? "bg-[#1F3A5F] text-white"
                      : "bg-transparent text-[#1F3A5F] hover:bg-white/70"
                  }`}
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                >
                  {f}
                </button>
              ))}
              <div className="ml-auto px-2.5 py-2 rounded-[12px] bg-white/65 flex items-center">
                <Filter size={16} className="text-[#1F3A5F]/70" />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block xl:hidden mb-10">
          <div className="rounded-[24px] bg-[#597eb1] p-[6px] overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {portfolioFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-4 py-2.5 rounded-full text-[14px] whitespace-nowrap transition-colors ${
                    active === f
                      ? "bg-white text-[#1F3A5F]"
                      : "text-white hover:bg-white/15"
                  }`}
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                >
                  {f}
                </button>
              ))}
              <div className="px-3 py-2 flex items-center rounded-full shrink-0">
                <Filter size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex justify-center mb-10 sm:mb-14">
          <div className="flex items-center bg-[#597eb1] rounded-full p-[6px] gap-1 max-w-full">
            {portfolioFilters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-5 sm:px-6 py-3 rounded-full text-[14px] sm:text-[16px] transition-colors ${
                  active === f
                    ? "bg-white text-[#1F3A5F]"
                    : "text-white hover:bg-white/15"
                }`}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              >
                {f}
              </button>
            ))}
            <div className="px-3 py-2 flex items-center rounded-full">
              <Filter size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          className={
            isReelCategory
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 xl:gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7"
          }
        >
          {visibleProjects.length === 0 ? (
            <div className="col-span-full rounded-[30px] border border-white/80 bg-white/60 px-6 py-16 text-center shadow-[8px_8px_18px_rgba(31,58,95,0.08),-6px_-6px_16px_rgba(255,255,255,0.85)]">
              <p
                className="text-[#1F3A5F] text-[22px] sm:text-[28px]"
                style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}
              >
                {active} Portfolio Coming Soon
              </p>
              <p
                className="text-[#1F3A5F]/70 text-[15px] sm:text-[17px] max-w-[560px] mx-auto mt-3"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.6 }}
              >
                This section is ready and I can slot the new Vimeo links in as soon as you send them.
              </p>
            </div>
          ) : visibleProjects.map((project) => (
            <div
              key={project.id}
              id={`portfolio-${project.id}`}
              className={
                project.mediaType === "external" || (isReelCategory && project.mediaType === "video")
                  ? `rounded-[24px] sm:rounded-[30px] overflow-hidden group transition-all ${highlightedId === project.id ? "ring-2 ring-[#2FA4A9] ring-offset-4 ring-offset-white" : ""}`
                  : `bg-[#f1f5f8] rounded-[24px] sm:rounded-[30px] overflow-hidden group border border-white/80 transition-all ${highlightedId === project.id ? "ring-2 ring-[#2FA4A9] ring-offset-4 ring-offset-white" : ""}`
              }
              style={
                project.mediaType === "external" || (isReelCategory && project.mediaType === "video")
                  ? undefined
                  : {
                      boxShadow:
                        "8px 8px 18px rgba(31,58,95,0.08), -6px -6px 16px rgba(255,255,255,0.85), inset 1px 1px 0 rgba(255,255,255,0.9)",
                    }
              }
            >
              {/* Image */}
              <div className={project.mediaType === "external" || (isReelCategory && project.mediaType === "video") ? "" : "p-[6px] sm:p-[7px] pb-0"}>
                {project.mediaType === "external" || (isReelCategory && project.mediaType === "video") ? (
                  (() => {
                    const thumbnailSources = project.mediaType === "external" ? getVimeoThumbnailSources(project.media) : [];
                    const thumbnailAttempt = thumbnailAttempts[project.id] ?? 0;
                    const activeThumbnailSource = thumbnailSources[thumbnailAttempt];

                    return (
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(project)}
                    className="aspect-[9/16] rounded-[24px] sm:rounded-[30px] overflow-hidden relative w-full bg-[linear-gradient(135deg,#1F3A5F_0%,#2FA4A9_100%)] text-white block"
                  >
                    {project.mediaType === "external" && activeThumbnailSource ? (
                      <img
                        src={activeThumbnailSource}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={() => {
                          setThumbnailAttempts((prev) => ({
                            ...prev,
                            [project.id]: Math.min(thumbnailAttempt + 1, thumbnailSources.length),
                          }));
                        }}
                      />
                    ) : null}
                    {project.mediaType === "video" ? (
                      <video
                        src={project.media}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/18 transition-colors duration-300 group-hover:bg-black/24" />
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white text-[#1F3A5F] shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <Play size={24} fill="currentColor" className="ml-0.5" />
                    </div>
                    <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/28 backdrop-blur-sm text-white flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <ExternalLink size={16} />
                    </div>
                  </button>
                    );
                  })()
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (project.mediaType === "image") {
                        setSelectedImage(project);
                      }
                    }}
                    className="aspect-[4/3] rounded-[20px] sm:rounded-[26px] overflow-hidden relative w-full text-left"
                  >
                    {project.mediaType === "video" ? (
                    <video
                      src={project.media}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    ) : (
                      <img
                        src={project.media}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {project.hoverTag && project.mediaType === "image" && (
                      <div className="pointer-events-none absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span
                          className="inline-flex rounded-full bg-black/55 text-white text-[11px] sm:text-[12px] px-3 py-1 uppercase tracking-[0.08em]"
                          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                        >
                          {project.hoverTag}
                        </span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10 sm:mt-12">
            <button
              onClick={handleLoadMore}
              className="bg-white text-[#1F3A5F] border border-[#1F3A5F]/15 text-[13px] sm:text-[14px] px-8 sm:px-10 py-3.5 rounded-full hover:bg-[#eef3f8] transition-colors uppercase tracking-[0.06em]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
            >
              Load More
            </button>
          </div>
        )}

        {selectedImage && (
          <div
            className="fixed inset-0 z-[120] bg-black/80 p-4 sm:p-6 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative w-full max-w-[1200px] max-h-[92vh] rounded-[18px] overflow-hidden bg-black"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
              <img
                src={selectedImage.media}
                alt={selectedImage.title}
                className="w-full h-full max-h-[92vh] object-contain"
              />
            </div>
          </div>
        )}

        {selectedVideo && (
          <div
            className="fixed inset-0 z-[120] bg-black/80 p-4 sm:p-6 flex items-center justify-center"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className={`relative w-full rounded-[18px] overflow-hidden bg-black shadow-[0_24px_80px_rgba(0,0,0,0.35)] ${
                isVerticalSelectedVideo ? "max-w-[420px] sm:max-w-[460px]" : "max-w-[1200px]"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Close video preview"
              >
                <X size={18} />
              </button>
              {selectedVideo.mediaType === "external" ? (
                <div className={`${isVerticalSelectedVideo ? "aspect-[9/16]" : "aspect-video"} w-full bg-black`}>
                  <iframe
                    src={getVimeoEmbedUrl(selectedVideo.media)}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={selectedVideo.title}
                  />
                </div>
              ) : (
                <div className={`${isVerticalSelectedVideo ? "aspect-[9/16]" : "aspect-video"} w-full bg-black`}>
                  <video
                    src={selectedVideo.media}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
