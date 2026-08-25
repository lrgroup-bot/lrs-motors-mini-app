import { Metadata } from "next";
import { Inventory } from "@/components/pages/Inventory";

export const metadata: Metadata = {
  title: "Inventory - LRS Motors",
  description: "Manage your vehicles inventory",
};

export default function InventoryPage() {
  return <Inventory />;
}
