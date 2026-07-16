import { MetadataRoute } from "next";
import { metaData } from "./config";

const BaseUrl = metaData.baseUrl.endsWith("/")
  ? metaData.baseUrl
  : `${metaData.baseUrl}/`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString().split("T")[0];

  return [
    { url: BaseUrl, lastModified },
    { url: `${BaseUrl}links`, lastModified },
  ];
}
