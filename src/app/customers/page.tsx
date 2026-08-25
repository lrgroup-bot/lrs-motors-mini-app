import { Metadata } from "next";
import { Customers } from "@/components/pages/Customers";

export const metadata: Metadata = {
  title: "Customers - LRS Motors",
  description: "Manage your customer database",
};

export default function CustomersPage() {
  return <Customers />;
}
