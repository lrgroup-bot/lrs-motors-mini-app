"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Megaphone } from "lucide-react";

export function Marketing() {
  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader
        title="Marketing"
        description="Manage marketing campaigns and vehicle listings"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-lrs-blue" />
              <h2 className="text-xl font-semibold text-gray-900">Marketing Management</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Marketing interface coming soon</p>
              <p className="text-sm text-gray-400">Features will include:</p>
              <ul className="text-sm text-gray-400 mt-3 space-y-1">
                <li>• WhatsApp, Facebook, Instagram integration</li>
                <li>• Website vehicle posting</li>
                <li>• Marketing campaign tracking</li>
                <li>• Lead source analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
