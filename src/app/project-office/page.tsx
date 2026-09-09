import type { Metadata } from "next";
import { TmcWorldPage } from "@/components/TmcWorldPage";

export const metadata: Metadata = {
  title: "TMC Project Office — Projects · Investments · Advisory",
  description:
    "Projects, investments and advisory focused on turning opportunities into execution.",
};

export default function ProjectOfficePage() {
  return <TmcWorldPage unitId="tmc-project-office" />;
}
