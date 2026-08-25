"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Users, Mail, Phone, MapPin } from "lucide-react";

export function Customers() {
  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-lrs-blue" />
              <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Customer management interface coming soon</p>
              <p className="text-sm text-gray-400">Features will include:</p>
              <ul className="text-sm text-gray-400 mt-3 space-y-1">
                <li>• Customer profiles and contact details</li>
                <li>• Purchase history</li>
                <li>• Communication tracking</li>
                <li>• Lead management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
