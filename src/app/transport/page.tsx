import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

export const metadata: Metadata = {
  title: "TMC Transport — Private Mobility",
  description: "Private mobility across ground, marine and aviation services.",
};

export default function TransportPage() {
  return <TmcWorldPage unitId="tmc-transport" />;
}
