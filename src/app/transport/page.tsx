import type { Metadata } from "next";
import { StaticUnitPage } from "@/components/units/StaticUnitPage";
import { tmcAssets } from "@/config/tmcAssets";

const title = "TMC Transport — Private Mobility";
const description = "Private mobility across ground, marine and aviation services.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/transport" },
  openGraph: {
    title,
    description,
    url: "/transport",
    siteName: "TMC World",
    type: "website",
    images: [{ url: tmcAssets.ogImage, width: 1200, height: 630 }],
  },
};

export default function TransportPage() {
  return <StaticUnitPage unitId="tmc-transport" />;
}
