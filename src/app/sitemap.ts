import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-04-23T00:00:00.000Z");

  return [
    {
      url: "https://mymuscle.app",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://mymuscle.app/privacy",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://mymuscle.app/terms",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
