"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Car } from "lucide-react";
import { useState } from "react";

interface Vehicle {
  id: string;
  regNumber: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuel: string;
  km: number;
  purchasePrice: number;
  sellingPrice: number;
  status: "available" | "reserved" | "sold";
  photos: string[];
  hasRC: boolean;
  hasInsurance: boolean;
  hasPUCC: boolean;
}

const mockInventory: Vehicle[] = [
  {
    id: "1",
    regNumber: "KA01AB1234",
    make: "Hyundai",
    model: "i20",
    variant: "Sportz Diesel",
    year: 2021,
    fuel: "Diesel",
    km: 45000,
    purchasePrice: 550000,
    sellingPrice: 650000,
    status: "available",
    photos: [],
    hasRC: true,
    hasInsurance: true,
    hasPUCC: true,
  },
  {
    id: "2",
    regNumber: "KA02BC5678",
    make: "Toyota",
    model: "Fortuner",
    variant: "4x4 Manual",
    year: 2019,
    fuel: "Diesel",
    km: 62000,
    purchasePrice: 1000000,
    sellingPrice: 1200000,
    status: "available",
    photos: [],
    hasRC: true,
    hasInsurance: true,
    hasPUCC: false,
  },
  {
    id: "3",
    regNumber: "KA03CD9012",
    make: "Maruti",
    model: "Swift",
    variant: "VXi Petrol",
    year: 2020,
    fuel: "Petrol",
    km: 32000,
    purchasePrice: 420000,
    sellingPrice: 480000,
    status: "reserved",
    photos: [],
    hasRC: true,
    hasInsurance: true,
    hasPUCC: true,
  },
  {
    id: "4",
    regNumber: "KA04DE3456",
    make: "Hyundai",
    model: "Creta",
    variant: "SX Automatic",
    year: 2022,
    fuel: "Petrol",
    km: 8000,
    purchasePrice: 950000,
    sellingPrice: 1050000,
    status: "available",
    photos: [],
    hasRC: true,
    hasInsurance: true,
    hasPUCC: true,
  },
];

const statusColors = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-gray-100 text-gray-700",
};

export function Inventory() {
  const [filter, setFilter] = useState<"all" | "available" | "reserved" | "sold">("all");

  const filtered = filter === "all" 
    ? mockInventory 
    : mockInventory.filter(v => v.status === filter);

  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader
        title="Inventory"
        description="Manage your vehicle inventory"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "available", "reserved", "sold"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-lrs-blue text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Vehicle Cards */}
        <div className="space-y-4">
          {filtered.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-4 p-6">
                  {/* Vehicle Image Placeholder */}
                  <div className="w-full md:w-48 h-40 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-center">
                      <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No Photos</p>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500">{vehicle.variant}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[vehicle.status]}`}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </div>

                    {/* Key Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Registration</p>
                        <p className="font-semibold text-gray-900">{vehicle.regNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Fuel Type</p>
                        <p className="font-semibold text-gray-900">{vehicle.fuel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Kilometers</p>
                        <p className="font-semibold text-gray-900">{vehicle.km.toLocaleString()} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Year</p>
                        <p className="font-semibold text-gray-900">{vehicle.year}</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Purchase Price</p>
                          <p className="font-semibold text-gray-900">₹{(vehicle.purchasePrice / 100000).toFixed(2)}L</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Selling Price</p>
                          <p className="font-semibold text-lrs-blue text-lg">₹{(vehicle.sellingPrice / 100000).toFixed(2)}L</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { label: "RC", has: vehicle.hasRC },
                          { label: "Insurance", has: vehicle.hasInsurance },
                          { label: "PUCC", has: vehicle.hasPUCC },
                        ].map((doc) => (
                          <span
                            key={doc.label}
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              doc.has
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {doc.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
