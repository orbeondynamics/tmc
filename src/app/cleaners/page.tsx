import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

export const metadata: Metadata = {
  title: "TMC Cleaners — Private Home & Property Care",
  description: "Private home and property care for luxury residences and short-term rentals.",
};

export default function CleanersPage() {
  return <TmcWorldPage unitId="tmc-cleaners" />;
}
