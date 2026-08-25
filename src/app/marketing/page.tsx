import { Metadata } from "next";
import { Marketing } from "@/components/pages/Marketing";

export const metadata: Metadata = {
  title: "Marketing - LRS Motors",
  description: "Manage marketing campaigns and vehicle listings",
};

export default function MarketingPage() {
  return <Marketing />;
}
