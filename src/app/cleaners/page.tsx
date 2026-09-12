import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";
import { tmcAssets } from "@/config/tmcAssets";

const title = "TMC Cleaners — Private Home & Property Care";
const description = "Private home and property care for luxury residences and short-term rentals.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cleaners" },
  openGraph: {
    title,
    description,
    url: "/cleaners",
    siteName: "TMC World",
    type: "website",
    images: [{ url: tmcAssets.ogImage, width: 1200, height: 630 }],
  },
};

export default function CleanersPage() {
  return <TmcWorldPage unitId="tmc-cleaners" />;
}
