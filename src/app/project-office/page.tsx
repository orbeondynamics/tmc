import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

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
  },
};

export default function ProjectOfficePage() {
  return <TmcWorldPage unitId="tmc-project-office" />;
}
