import { Metadata } from "next";
import { Reports } from "@/components/pages/Reports";

export const metadata: Metadata = {
  title: "Reports - LRS Motors",
  description: "View comprehensive business reports and analytics",
};

export default function ReportsPage() {
  return <Reports />;
}
