import { Metadata } from "next";
import { Sales } from "@/components/pages/Sales";

export const metadata: Metadata = {
  title: "Sales - LRS Motors",
  description: "Track and manage sales records",
};

export default function SalesPage() {
  return <Sales />;
}
