import { Metadata } from "next";
import { Dashboard } from "@/components/pages/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard - LRS Motors",
  description: "View your dealership overview and key metrics",
};

export default function DashboardPage() {
  return <Dashboard />;
}
