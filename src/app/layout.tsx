import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "LRS Motors - PC Server",
  description: "LRS Motors dealership management server",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-lrs-light">
        <AuthProvider>
          <div className="flex flex-col min-h-screen md:flex-row">
            <Navigation />
            <main className="flex-1 pb-20 md:pb-0 md:ml-64">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
