import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

const title = "TMC Luxury — Private Property Management";
const description = "Private property management for high-value residences and estates.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/luxury" },
  openGraph: { title, description, url: "/luxury", siteName: "TMC World", type: "website" },
};

export default function LuxuryPage() {
  return <TmcWorldPage unitId="tmc-luxury" />;
}
