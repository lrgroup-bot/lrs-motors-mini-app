"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
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

type VehicleForm = Omit<Vehicle, "id">;

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

const STORAGE_KEY = "lrs-vehicles";

export function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | VehicleStatus>("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyVehicle);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setVehicles(saved ? JSON.parse(saved) : []);
    } catch {
      setVehicles([]);
      setError("Could not load local inventory data.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  function persist(nextVehicles: Vehicle[]) {
    setVehicles(nextVehicles);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVehicles));
  }

  const filteredVehicles = useMemo(() => {
    const query = search.toLowerCase().trim();
    return vehicles.filter((vehicle) => {
      const matchesSearch = !query || `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(query) || vehicle.year.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  const inventoryStats = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "Available").length,
    reserved: vehicles.filter((v) => v.status === "Reserved").length,
    sold: vehicles.filter((v) => v.status === "Sold").length,
    service: vehicles.filter((v) => v.status === "Service").length,
  }), [vehicles]);

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

    const cleaned: VehicleForm = {
      ...form,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year.trim(),
      km: form.km.trim(),
      price: form.price.trim(),
    };

    if (editingId) {
      persist(vehicles.map((vehicle) => vehicle.id === editingId ? { id: editingId, ...cleaned } : vehicle));
    } else {
      persist([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...cleaned }, ...vehicles]);
    }

    setSaving(false);
    setShowModal(false);
    setEditingId(null);
    setForm(emptyVehicle);
  }

  function deleteVehicle(id: string) {
    const vehicle = vehicles.find((item) => item.id === id);
    if (!vehicle) return;
    if (!window.confirm(`Delete ${vehicle.brand} ${vehicle.model} from inventory?`)) return;
    persist(vehicles.filter((item) => item.id !== id));
  }

  function updateStatus(id: string, status: VehicleStatus) {
    persist(vehicles.map((vehicle) => vehicle.id === id ? { ...vehicle, status } : vehicle));
  }

  if (isLoading || loading) {
    return <div className="min-h-screen bg-lrs-light flex items-center justify-center"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" /><p className="text-sm text-gray-500 mt-3">Loading LRS Motors...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader title="Dashboard" description="Overview of your dealership performance" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3">
          <div><p className="text-xs text-gray-500">Signed in as administrator</p><p className="text-sm font-medium text-gray-900">{user?.email || user?.name || "LRS Motors Admin"}</p></div>
          <button type="button" onClick={logout} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"><LogOut className="w-4 h-4" />Sign Out</button>
        </div>

        {error && !showModal && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Car className="w-6 h-6" />} title="Total Vehicles" value={String(inventoryStats.total)} subtitle="In inventory" color="blue" />
          <StatCard icon={<TrendingUp className="w-6 h-6" />} title="Available" value={String(inventoryStats.available)} subtitle="Ready to sell" color="green" />
          <StatCard icon={<Lock className="w-6 h-6" />} title="Reserved" value={String(inventoryStats.reserved)} subtitle="Pending sale" color="orange" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} title="Sold" value={String(inventoryStats.sold)} subtitle="Vehicles sold" color="green" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="w-6 h-6" />} title="Total Sales" value="₹28.5L" subtitle="This month" trend="up" trendValue="+12%" color="green" />
          <StatCard icon={<DollarSign className="w-6 h-6" />} title="Estimated Profit" value="₹4.8L" subtitle="This month" trend="up" trendValue="+8%" color="green" />
          <StatCard icon={<Users className="w-6 h-6" />} title="Customer Leads" value="12" subtitle="Active leads" color="purple" />
          <StatCard icon={<Calendar className="w-6 h-6" />} title="Test Drives" value="5" subtitle="Scheduled this week" color="blue" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div><h2 className="text-xl font-bold text-gray-900">Vehicle Inventory</h2><p className="text-sm text-gray-500 mt-1">Local inventory stored on this PC</p></div>
                <button type="button" onClick={openAddModal} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-lrs-primary text-white font-medium hover:opacity-90"><Plus className="w-4 h-4" />Add Vehicle</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <MiniStat label="Total" value={inventoryStats.total} />
                <MiniStat label="Available" value={inventoryStats.available} />
                <MiniStat label="Reserved" value={inventoryStats.reserved} />
                <MiniStat label="Sold" value={inventoryStats.sold} />
                <MiniStat label="Service" value={inventoryStats.service} />
              </div>

              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand, model or year..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white outline-none focus:border-lrs-primary" /></div>

              <div className="flex gap-2 overflow-x-auto">
                {["All", "Available", "Reserved", "Sold", "Service"].map((filter) => <button key={filter} type="button" onClick={() => setStatusFilter(filter as "All" | VehicleStatus)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${statusFilter === filter ? "bg-lrs-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{filter}</button>)}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredVehicles.length === 0 ? (
              <div className="py-12 text-center"><Car className="w-12 h-12 mx-auto text-gray-300" /><h3 className="mt-3 font-semibold text-gray-900">No vehicles found</h3><p className="text-sm text-gray-500 mt-1">Add your first vehicle to the inventory.</p><button type="button" onClick={openAddModal} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lrs-primary text-white text-sm font-medium"><Plus className="w-4 h-4" />Add Vehicle</button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={() => openEditModal(vehicle)} onDelete={() => deleteVehicle(vehicle.id)} onStatusChange={(status) => updateStatus(vehicle.id, status)} />)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3></CardHeader>
          <CardContent><button type="button" onClick={openAddModal} className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg bg-lrs-light hover:bg-gray-200 transition-colors w-full sm:w-48"><Plus className="w-7 h-7 text-gray-700" /><span className="text-sm font-medium text-gray-700">Add Vehicle</span></button></CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b bg-white"><div><h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Vehicle" : "Add Vehicle"}</h2><p className="text-sm text-gray-500 mt-1">Vehicle information</p></div><button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Brand" required><input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Hyundai" className="input-field" /></FormField>
                <FormField label="Model" required><input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Creta SX" className="input-field" /></FormField>
                <FormField label="Model Year"><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" className="input-field" /></FormField>
                <FormField label="Running KM"><input value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="35,000" className="input-field" /></FormField>
                <FormField label="Fuel"><select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="input-field"><option>Petrol</option><option>Diesel</option><option>Petrol/CNG</option><option>Electric</option><option>Hybrid</option></select></FormField>
                <FormField label="Transmission"><select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="input-field"><option>Manual</option><option>Automatic</option><option>AMT</option><option>CVT</option><option>DCT</option></select></FormField>
                <FormField label="Selling Price" required><input required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="6,50,000" className="input-field" /></FormField>
                <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })} className="input-field"><option>Available</option><option>Reserved</option><option>Sold</option><option>Service</option></select></FormField>
              </div>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border cursor-pointer"><input type="checkbox" checked={form.refinance} onChange={(e) => setForm({ ...form, refinance: e.target.checked })} className="w-5 h-5" /><div><p className="font-medium text-gray-900">Refinance Available</p><p className="text-sm text-gray-500">Show refinance availability.</p></div></label>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3"><button type="button" disabled={saving} onClick={closeModal} className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="px-5 py-3 rounded-lg bg-lrs-primary text-white font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editingId ? "Update Vehicle" : "Add Vehicle"}</button></div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`.input-field{width:100%;border:1px solid rgb(229 231 235);border-radius:.5rem;padding:.7rem .8rem;font-size:.875rem;outline:none;background:white;color:rgb(17 24 39)}.input-field:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgb(37 99 235 / 10%)}`}</style>
    </div>
  );
}

function VehicleCard({ vehicle, onEdit, onDelete, onStatusChange }: { vehicle: Vehicle; onEdit: () => void; onDelete: () => void; onStatusChange: (status: VehicleStatus) => void; }) {
  return <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"><div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><Car className="w-14 h-14 text-gray-400" /></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gray-500 uppercase">{vehicle.brand}</p><h3 className="font-bold text-lg text-gray-900">{vehicle.model}</h3></div><StatusBadge status={vehicle.status} /></div><div className="grid grid-cols-2 gap-3 mt-4"><VehicleInfo icon={<Calendar className="w-4 h-4" />} label="Year" value={vehicle.year || "-"} /><VehicleInfo icon={<Gauge className="w-4 h-4" />} label="Running" value={`${vehicle.km || "-"} KM`} /><VehicleInfo icon={<Fuel className="w-4 h-4" />} label="Fuel" value={vehicle.fuel} /><VehicleInfo icon={<Settings2 className="w-4 h-4" />} label="Gear" value={vehicle.transmission} /></div><div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2"><div><p className="text-xs text-gray-500">Selling Price</p><p className="text-xl font-bold text-gray-900 flex items-center"><IndianRupee className="w-4 h-4" />{vehicle.price}</p></div>{vehicle.refinance && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Refinance</span>}</div><div className="mt-4"><select value={vehicle.status} onChange={(e) => onStatusChange(e.target.value as VehicleStatus)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"><option>Available</option><option>Reserved</option><option>Sold</option><option>Service</option></select></div><div className="flex gap-2 mt-3"><button type="button" onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"><Pencil className="w-4 h-4" />Edit</button><button type="button" onClick={onDelete} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button></div></div></div>;
}

function MiniStat({ label, value }: { label: string; value: number; }) { return <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-3"><p className="text-xs text-gray-500">{label}</p><p className="text-lg font-bold text-gray-900 mt-1">{value}</p></div>; }
function VehicleInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string; }) { return <div className="flex items-center gap-2"><div className="text-gray-400">{icon}</div><div className="min-w-0"><p className="text-[10px] uppercase text-gray-400">{label}</p><p className="text-xs font-medium text-gray-700 truncate">{value}</p></div></div>; }
function StatusBadge({ status }: { status: VehicleStatus; }) { const styles: Record<VehicleStatus,string> = { Available:"bg-green-100 text-green-700", Reserved:"bg-yellow-100 text-yellow-700", Sold:"bg-blue-100 text-blue-700", Service:"bg-gray-100 text-gray-700" }; return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>; }
function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode; }) { return <div><label className="block text-sm font-medium text-gray-700 mb-2">{label}{required && <span className="text-red-500"> *</span>}</label>{children}</div>; }
