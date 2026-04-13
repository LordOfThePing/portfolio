import { MetadataRoute } from "next";
import { metaData } from "./config";

const BaseUrl = metaData.baseUrl.endsWith("/")
  ? metaData.baseUrl
  : `${metaData.baseUrl}/`;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BaseUrl,
      lastModified: new Date().toISOString().split("T")[0],
    },
  ];
}
