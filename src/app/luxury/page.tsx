import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

export const metadata: Metadata = {
  title: "TMC Luxury — Private Property Management",
  description: "Private property management for high-value residences and estates.",
};

export default function LuxuryPage() {
  return <TmcWorldPage unitId="tmc-luxury" />;
}
