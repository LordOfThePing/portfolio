import { metaData } from "./config";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin", "/api/", "/blog/p/"],
      },
    ],
    sitemap: `${metaData.baseUrl}/sitemap.xml`,
  };
}
