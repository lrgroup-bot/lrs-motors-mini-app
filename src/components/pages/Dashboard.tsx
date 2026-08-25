"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  LogOut,
  Loader2,
} from "lucide-react";

type VehicleStatus = "Available" | "Reserved" | "Sold" | "Service";

type Vehicle = {
  id: string;
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

type VehicleForm = {
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

const emptyVehicle: VehicleForm = {
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
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | VehicleStatus
  >("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyVehicle);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkAdminAndLoadVehicles();
  }, []);

  async function checkAdminAndLoadVehicles() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUserEmail(user.email || "");

    const { data, error: vehiclesError } = await supabase
      .from("vehicles")
      .select(
        "id, brand, model, year, km, fuel, transmission, price, status, refinance"
      )
      .order("created_at", { ascending: false });

    if (vehiclesError) {
      console.error(vehiclesError);
      setError(vehiclesError.message);
      setLoading(false);
      return;
    }

    setVehicles(
      (data || []).map((vehicle) => ({
        id: String(vehicle.id),
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: String(vehicle.year || ""),
        km: String(vehicle.km || ""),
        fuel: vehicle.fuel || "Petrol",
        transmission: vehicle.transmission || "Manual",
        price: String(vehicle.price || ""),
        status: vehicle.status as VehicleStatus,
        refinance: Boolean(vehicle.refinance),
      }))
    );

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

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

  const inventoryStats = useMemo(
    () => ({
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === "Available").length,
      reserved: vehicles.filter((v) => v.status === "Reserved").length,
      sold: vehicles.filter((v) => v.status === "Sold").length,
      service: vehicles.filter((v) => v.status === "Service").length,
    }),
    [vehicles]
  );

  function openAddModal() {
    setEditingId(null);
    setForm(emptyVehicle);
    setError("");
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

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyVehicle);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.brand.trim() || !form.model.trim() || !form.price.trim()) {
      setError("Brand, model and price are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year ? Number(form.year) : null,
      km: form.km.trim(),
      fuel: form.fuel,
      transmission: form.transmission,
      price: form.price.trim(),
      status: form.status,
      refinance: form.refinance,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("vehicles")
        .update(payload)
        .eq("id", editingId)
        .select(
          "id, brand, model, year, km, fuel, transmission, price, status, refinance"
        )
        .single();

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      if (data) {
        setVehicles((current) =>
          current.map((vehicle) =>
            vehicle.id === String(data.id)
              ? mapVehicle(data)
              : vehicle
          )
        );
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("vehicles")
        .insert(payload)
        .select(
          "id, brand, model, year, km, fuel, transmission, price, status, refinance"
        )
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      if (data) {
        setVehicles((current) => [mapVehicle(data), ...current]);
      }
    }

    setSaving(false);
    closeModal();
  }

  async function deleteVehicle(id: string) {
    const vehicle = vehicles.find((item) => item.id === id);

    if (!vehicle) return;

    const confirmed = window.confirm(
      `Delete ${vehicle.brand} ${vehicle.model} from inventory?`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setVehicles((current) =>
      current.filter((vehicle) => vehicle.id !== id)
    );
  }

  async function updateStatus(
    id: string,
    status: VehicleStatus
  ) {
    setError("");

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, status } : vehicle
      )
    );
  }

  function mapVehicle(vehicle: any): Vehicle {
    return {
      id: String(vehicle.id),
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: String(vehicle.year || ""),
      km: String(vehicle.km || ""),
      fuel: vehicle.fuel || "Petrol",
      transmission: vehicle.transmission || "Manual",
      price: String(vehicle.price || ""),
      status: vehicle.status as VehicleStatus,
      refinance: Boolean(vehicle.refinance),
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lrs-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" />
          <p className="text-sm text-gray-500 mt-3">
            Loading LRS Motors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader
        title="Dashboard"
        description="Overview of your dealership performance"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ADMIN BAR */}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">
              Signed in as administrator
            </p>

            <p className="text-sm font-medium text-gray-900">
              {userEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* DASHBOARD STATS */}

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
            title="Sold"
            value={String(inventoryStats.sold)}
            subtitle="Vehicles sold"
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

        {/* INVENTORY */}

        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Vehicle Inventory
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Live inventory from Supabase
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-lrs-primary text-white font-medium hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </button>
              </div>

              {/* COUNTS */}

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <MiniStat
                  label="Total"
                  value={inventoryStats.total}
                />

                <MiniStat
                  label="Available"
                  value={inventoryStats.available}
                />

                <MiniStat
                  label="Reserved"
                  value={inventoryStats.reserved}
                />

                <MiniStat
                  label="Sold"
                  value={inventoryStats.sold}
                />

                <MiniStat
                  label="Service"
                  value={inventoryStats.service}
                />
              </div>

              {/* SEARCH */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search brand, model or year..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white outline-none focus:border-lrs-primary"
                />
              </div>

              {/* FILTERS */}

              <div className="flex gap-2 overflow-x-auto">
                {[
                  "All",
                  "Available",
                  "Reserved",
                  "Sold",
                  "Service",
                ].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        filter as "All" | VehicleStatus
                      )
                    }
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
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
                <Car className="w-12 h-12 mx-auto text-gray-300" />

                <h3 className="mt-3 font-semibold text-gray-900">
                  No vehicles found
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add your first vehicle to the inventory.
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

        {/* RECENT SALES */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                ].map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {sale.vehicle}
                      </p>

                      <p className="text-sm text-gray-500">
                        {sale.date}
                      </p>
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

          {/* TEST DRIVES */}

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
                ].map((event, index) => (
                  <div
                    key={index}
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

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTION */}

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </CardHeader>

          <CardContent>
            <button
              type="button"
              onClick={openAddModal}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg bg-lrs-light hover:bg-gray-200 transition-colors w-full sm:w-48"
            >
              <Plus className="w-7 h-7 text-gray-700" />

              <span className="text-sm font-medium text-gray-700">
                Add Vehicle
              </span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Vehicle" : "Add Vehicle"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Vehicle information
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-5"
            >
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Brand" required>
                  <input
                    required
                    value={form.brand}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        brand: event.target.value,
                      })
                    }
                    placeholder="Hyundai"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Model" required>
                  <input
                    required
                    value={form.model}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        model: event.target.value,
                      })
                    }
                    placeholder="Creta SX"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Model Year">
                  <input
                    type="number"
                    value={form.year}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        year: event.target.value,
                      })
                    }
                    placeholder="2024"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Running KM">
                  <input
                    value={form.km}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        km: event.target.value,
                      })
                    }
                    placeholder="35,000"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Fuel">
                  <select
                    value={form.fuel}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        fuel: event.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Petrol/CNG</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </FormField>

                <FormField label="Transmission">
                  <select
                    value={form.transmission}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        transmission: event.target.value,
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
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                    placeholder="6,50,000"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status:
                          event.target.value as VehicleStatus,
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

              <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.refinance}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      refinance: event.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />

                <div>
                  <p className="font-medium text-gray-900">
                    Refinance Available
                  </p>

                  <p className="text-sm text-gray-500">
                    Show refinance availability.
                  </p>
                </div>
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-lg bg-lrs-primary text-white font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {editingId
                    ? "Update Vehicle"
                    : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
        }
      `}</style>
    </div>
  );
}

/* VEHICLE CARD */

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
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Car className="w-14 h-14 text-gray-400" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase">
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
            value={`${vehicle.km || "-"} KM`}
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

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500">
              Selling Price
            </p>

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

        <div className="mt-4">
          <select
            value={vehicle.status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as VehicleStatus
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
          >
            <option>Available</option>
            <option>Reserved</option>
            <option>Sold</option>
            <option>Service</option>
          </select>
        </div>

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
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* HELPERS */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">
        {value}
      </p>
    </div>
  );
}

function VehicleInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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

function StatusBadge({
  status,
}: {
  status: VehicleStatus;
}) {
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

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
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