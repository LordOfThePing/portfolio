import { metaData } from "./config";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${metaData.baseUrl}/sitemap.xml`,
  };
}
