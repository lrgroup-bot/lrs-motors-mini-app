import { Metadata } from "next";
import { Documents } from "@/components/pages/Documents";

export const metadata: Metadata = {
  title: "Documents - LRS Motors",
  description: "Manage vehicle documents and RC, Insurance, PUCC files",
};

export default function DocumentsPage() {
  return <Documents />;
}
