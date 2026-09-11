import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

const title = "TMC Cleaners — Private Home & Property Care";
const description = "Private home and property care for luxury residences and short-term rentals.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cleaners" },
  openGraph: { title, description, url: "/cleaners", siteName: "TMC World", type: "website" },
};

export default function CleanersPage() {
  return <TmcWorldPage unitId="tmc-cleaners" />;
}
