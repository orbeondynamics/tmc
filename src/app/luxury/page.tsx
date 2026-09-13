import type { Metadata } from "next";
import { StaticUnitPage } from "@/components/units/StaticUnitPage";
import { tmcAssets } from "@/config/tmcAssets";

const title = "TMC Luxury — Private Property Management";
const description = "Private property management for high-value residences and estates.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/luxury" },
  openGraph: {
    title,
    description,
    url: "/luxury",
    siteName: "TMC World",
    type: "website",
    images: [{ url: tmcAssets.ogImage, width: 1200, height: 630 }],
  },
};

export default function LuxuryPage() {
  return <StaticUnitPage unitId="tmc-luxury" />;
}
