import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { TelegramProvider } from "@/providers/TelegramProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "LRS Motors - Dealership Dashboard",
  description: "Manage your used cars and bikes dealership efficiently",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-lrs-light">
        <TelegramProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen md:flex-row">
              {/* Navigation */}
              <Navigation />
              
              {/* Main Content */}
              <main className="flex-1 pb-20 md:pb-0 md:ml-64">
                {children}
              </main>
            </div>
          </AuthProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
