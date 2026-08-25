import { Metadata } from "next";
import { Settings } from "@/components/pages/Settings";

export const metadata: Metadata = {
  title: "Settings - LRS Motors",
  description: "Configure application settings and preferences",
};

export default function SettingsPage() {
  return <Settings />;
}
