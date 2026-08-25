"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import {
  TrendingUp,
  Car,
  Lock,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Fuel,
  Gauge,
  Settings2,
  IndianRupee,
} from "lucide-react";

type VehicleStatus = "Available" | "Reserved" | "Sold" | "Service";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: string;
  km: string;
  fuel: string;
  transmission: string;
  price: string;
  status: VehicleStatus;
  refinance: boolean;
};

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    brand: "Hyundai",
    model: "i20 Sportz",
    year: "2015",
    km: "42,000",
    fuel: "Petrol",
    transmission: "Manual",
    price: "4,00,000",
    status: "Available",
    refinance: true,
  },
  {
    id: 2,
    brand: "Maruti Suzuki",
    model: "Dzire Tour",
    year: "2022",
    km: "53,000",
    fuel: "Petrol/CNG",
    transmission: "Manual",
    price: "6,50,000",
    status: "Available",
    refinance: true,
  },
  {
    id: 3,
    brand: "Toyota",
    model: "Fortuner",
    year: "2019",
    km: "68,000",
    fuel: "Diesel",
    transmission: "Automatic",
    price: "12,00,000",
    status: "Reserved",
    refinance: true,
  },
  {
    id: 4,
    brand: "Maruti Suzuki",
    model: "Swift",
    year: "2020",
    km: "35,000",
    fuel: "Petrol",
    transmission: "Manual",
    price: "4,80,000",
    status: "Sold",
    refinance: false,
  },
  {
    id: 5,
    brand: "Mahindra",
    model: "Thar",
    year: "2025",
    km: "35,000",
    fuel: "Diesel",
    transmission: "Manual",
    price: "12,00,000",
    status: "Available",
    refinance: true,
  },
];

const emptyVehicle: Omit<Vehicle, "id"> = {
  brand: "",
  model: "",
  year: "",
  km: "",
  fuel: "Petrol",
  transmission: "Manual",
  price: "",
  status: "Available",
  refinance: true,
};

export function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | VehicleStatus>(
    "All"
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyVehicle);

  const filteredVehicles = useMemo(() => {
    const query = search.toLowerCase().trim();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !query ||
        `${vehicle.brand} ${vehicle.model}`
          .toLowerCase()
          .includes(query) ||
        vehicle.year.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  const inventoryStats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === "Available").length,
      reserved: vehicles.filter((v) => v.status === "Reserved").length,
      sold: vehicles.filter((v) => v.status === "Sold").length,
      service: vehicles.filter((v) => v.status === "Service").length,
    };
  }, [vehicles]);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyVehicle);
    setShowModal(true);
  }

  function openEditModal(vehicle: Vehicle) {
    setEditingId(vehicle.id);

    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      km: vehicle.km,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      price: vehicle.price,
      status: vehicle.status,
      refinance: vehicle.refinance,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyVehicle);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.brand.trim() || !form.model.trim() || !form.price.trim()) {
      return;
    }

    if (editingId !== null) {
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === editingId ? { ...vehicle, ...form } : vehicle
        )
      );
    } else {
      const newVehicle: Vehicle = {
        id: Date.now(),
        ...form,
      };

      setVehicles((current) => [newVehicle, ...current]);
    }

    closeModal();
  }

  function deleteVehicle(id: number) {
    const vehicle = vehicles.find((item) => item.id === id);

    if (!vehicle) return;

    const confirmed = window.confirm(
      `Delete ${vehicle.brand} ${vehicle.model} from inventory?`
    );

    if (!confirmed) return;

    setVehicles((current) => current.filter((item) => item.id !== id));
  }

  function updateStatus(id: number, status: VehicleStatus) {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, status } : vehicle
      )
    );
  }

  function resetInventory() {
    const confirmed = window.confirm(
      "Reset inventory to the demo vehicles?"
    );

    if (!confirmed) return;

    setVehicles(initialVehicles);
  }

  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader
        title="Dashboard"
        description="Overview of your dealership performance"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== DASHBOARD STATS ==================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Car className="w-6 h-6" />}
            title="Total Vehicles"
            value={String(inventoryStats.total)}
            subtitle="In inventory"
            color="blue"
          />

          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Available"
            value={String(inventoryStats.available)}
            subtitle="Ready to sell"
            trend="up"
            trendValue="+5 this week"
            color="green"
          />

          <StatCard
            icon={<Lock className="w-6 h-6" />}
            title="Reserved"
            value={String(inventoryStats.reserved)}
            subtitle="Pending sale"
            color="orange"
          />

          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Sold This Month"
            value="8"
            subtitle="+3 this week"
            trend="up"
            trendValue="+60%"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Sales"
            value="₹28.5L"
            subtitle="This month"
            trend="up"
            trendValue="+12%"
            color="green"
          />

          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Estimated Profit"
            value="₹4.8L"
            subtitle="This month"
            trend="up"
            trendValue="+8%"
            color="green"
          />

          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Customer Leads"
            value="12"
            subtitle="Active leads"
            color="purple"
          />

          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Test Drives"
            value="5"
            subtitle="Scheduled this week"
            color="blue"
          />
        </div>

        {/* ==================== INVENTORY ==================== */}

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Vehicle Inventory
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage your showroom vehicles
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetInventory}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Reset demo inventory"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-lrs-primary text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                  </button>
                </div>
              </div>

              {/* Inventory Summary */}

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <InventoryMiniStat
                  label="Total"
                  value={inventoryStats.total}
                />

                <InventoryMiniStat
                  label="Available"
                  value={inventoryStats.available}
                />

                <InventoryMiniStat
                  label="Reserved"
                  value={inventoryStats.reserved}
                />

                <InventoryMiniStat
                  label="Sold"
                  value={inventoryStats.sold}
                />

                <InventoryMiniStat
                  label="Service"
                  value={inventoryStats.service}
                />
              </div>

              {/* Search */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vehicle by brand, model or year..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-lrs-primary/20 focus:border-lrs-primary"
                />
              </div>

              {/* Filters */}

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(
                  [
                    "All",
                    "Available",
                    "Reserved",
                    "Sold",
                    "Service",
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === filter
                        ? "bg-lrs-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredVehicles.length === 0 ? (
              <div className="py-12 text-center">
                <Car className="w-12 h-12 mx-auto text-gray-300 mb-3" />

                <h3 className="font-semibold text-gray-900">
                  No vehicles found
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Try changing your search or filter.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lrs-primary text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={() => openEditModal(vehicle)}
                    onDelete={() => deleteVehicle(vehicle.id)}
                    onStatusChange={(status) =>
                      updateStatus(vehicle.id, status)
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ==================== RECENT ACTIVITY ==================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Sales */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Sales
              </h3>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    vehicle: "Hyundai i20 2021",
                    price: "₹6.5L",
                    date: "Today",
                    profit: "₹80K",
                  },
                  {
                    vehicle: "Toyota Fortuner 2019",
                    price: "₹12L",
                    date: "Yesterday",
                    profit: "₹1.2L",
                  },
                  {
                    vehicle: "Maruti Swift 2020",
                    price: "₹4.8L",
                    date: "2 days ago",
                    profit: "₹60K",
                  },
                ].map((sale, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {sale.vehicle}
                      </p>
                      <p className="text-sm text-gray-500">{sale.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {sale.price}
                      </p>

                      <p className="text-sm text-green-600">
                        +{sale.profit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Test Drives */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Test Drives
              </h3>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    customer: "Rajesh Kumar",
                    vehicle: "Hyundai Creta",
                    time: "10:00 AM",
                    status: "Confirmed",
                  },
                  {
                    customer: "Priya Singh",
                    vehicle: "Maruti Vitara",
                    time: "2:30 PM",
                    status: "Confirmed",
                  },
                  {
                    customer: "Amit Patel",
                    vehicle: "Toyota Innova",
                    time: "4:00 PM",
                    status: "Pending",
                  },
                ].map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.customer}
                      </p>

                      <p className="text-sm text-gray-500">
                        {event.vehicle}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {event.time}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==================== QUICK ACTIONS ==================== */}

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction
                icon={<Plus className="w-6 h-6" />}
                label="Add Vehicle"
                onClick={openAddModal}
              />

              <QuickAction
                icon={<Users className="w-6 h-6" />}
                label="New Customer"
              />

              <QuickAction
                icon={<Calendar className="w-6 h-6" />}
                label="Schedule Test Drive"
              />

              <QuickAction
                icon={<TrendingUp className="w-6 h-6" />}
                label="View Reports"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== ADD / EDIT VEHICLE MODAL ==================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId !== null ? "Edit Vehicle" : "Add Vehicle"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter vehicle details for your inventory
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Brand" required>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    placeholder="e.g. Hyundai"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Model" required>
                  <input
                    required
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    placeholder="e.g. Creta SX"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Model Year">
                  <input
                    type="number"
                    min="1990"
                    max="2035"
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: e.target.value })
                    }
                    placeholder="2024"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Running KM">
                  <input
                    value={form.km}
                    onChange={(e) =>
                      setForm({ ...form, km: e.target.value })
                    }
                    placeholder="35,000"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Fuel Type">
                  <select
                    value={form.fuel}
                    onChange={(e) =>
                      setForm({ ...form, fuel: e.target.value })
                    }
                    className="input-field"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Petrol/CNG</option>
                    <option>Petrol/LPG</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </FormField>

                <FormField label="Transmission">
                  <select
                    value={form.transmission}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        transmission: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option>Manual</option>
                    <option>Automatic</option>
                    <option>AMT</option>
                    <option>CVT</option>
                    <option>DCT</option>
                  </select>
                </FormField>

                <FormField label="Selling Price" required>
                  <input
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="6,50,000"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as VehicleStatus,
                      })
                    }
                    className="input-field"
                  >
                    <option>Available</option>
                    <option>Reserved</option>
                    <option>Sold</option>
                    <option>Service</option>
                  </select>
                </FormField>
              </div>

              <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.refinance}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      refinance: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded"
                />

                <div>
                  <p className="font-medium text-gray-900">
                    Refinance Available
                  </p>

                  <p className="text-sm text-gray-500">
                    Show refinance availability on this vehicle.
                  </p>
                </div>
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg bg-lrs-primary text-white font-medium hover:opacity-90"
                >
                  {editingId !== null
                    ? "Update Vehicle"
                    : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Small CSS helpers for form fields */}

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.5rem;
          padding: 0.7rem 0.8rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
          color: rgb(17 24 39);
        }

        .input-field:focus {
          border-color: var(--lrs-primary, #2563eb);
          box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   VEHICLE CARD
============================================================ */

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: VehicleStatus) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Vehicle image placeholder */}

      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Car className="w-16 h-16 text-gray-400" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {vehicle.brand}
            </p>

            <h3 className="font-bold text-lg text-gray-900">
              {vehicle.model}
            </h3>
          </div>

          <StatusBadge status={vehicle.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <VehicleInfo
            icon={<Calendar className="w-4 h-4" />}
            label="Year"
            value={vehicle.year || "-"}
          />

          <VehicleInfo
            icon={<Gauge className="w-4 h-4" />}
            label="Running"
            value={`${vehicle.km} KM`}
          />

          <VehicleInfo
            icon={<Fuel className="w-4 h-4" />}
            label="Fuel"
            value={vehicle.fuel}
          />

          <VehicleInfo
            icon={<Settings2 className="w-4 h-4" />}
            label="Gear"
            value={vehicle.transmission}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Selling Price</p>

            <p className="text-xl font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-4 h-4" />
              {vehicle.price}
            </p>
          </div>

          {vehicle.refinance && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Refinance
            </span>
          )}
        </div>

        {/* Status selector */}

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-500">
            Change Status
          </label>

          <select
            value={vehicle.status}
            onChange={(e) =>
              onStatusChange(e.target.value as VehicleStatus)
            }
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
          >
            <option>Available</option>
            <option>Reserved</option>
            <option>Sold</option>
            <option>Service</option>
          </select>
        </div>

        {/* Actions */}

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            title="Delete vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUPPORTING COMPONENTS
============================================================ */

function InventoryMiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function VehicleInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase text-gray-400">
          {label}
        </p>

        <p className="text-xs font-medium text-gray-700 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const styles: Record<VehicleStatus, string> = {
    Available: "bg-green-100 text-green-700",
    Reserved: "bg-yellow-100 text-yellow-700",
    Sold: "bg-blue-100 text-blue-700",
    Service: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-lrs-light hover:bg-gray-200 transition-colors text-center"
    >
      <span className="text-gray-700">{icon}</span>

      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>
    </button>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {children}
    </div>
  );
}