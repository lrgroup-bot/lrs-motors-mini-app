import { Metadata } from "next";
import { VehicleData } from "@/components/pages/VehicleData";

export const metadata: Metadata = {
  title: "Vehicle Data - LRS Motors",
  description: "Brand, model, variant, year and automatic vehicle specifications",
};

export default function VehicleDataPage() {
  return <VehicleData />;
}
