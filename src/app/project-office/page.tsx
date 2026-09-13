import type { Metadata } from "next";
import { StaticUnitPage } from "@/components/units/StaticUnitPage";
import { tmcAssets } from "@/config/tmcAssets";

const title = "TMC Project Office — Projects · Investments · Advisory";
const description =
  "Projects, investments and advisory focused on turning opportunities into execution.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/project-office" },
  openGraph: {
    title,
    description,
    url: "/project-office",
    siteName: "TMC World",
    type: "website",
    images: [{ url: tmcAssets.ogImage, width: 1200, height: 630 }],
  },
};

export default function ProjectOfficePage() {
  return <StaticUnitPage unitId="tmc-project-office" />;
}
