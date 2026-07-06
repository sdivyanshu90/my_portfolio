import type { MetadataRoute } from "next";
import { personal, site } from "@/data/portfolio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: personal.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#faf7f0",
    theme_color: "#faf7f0",
  };
}
