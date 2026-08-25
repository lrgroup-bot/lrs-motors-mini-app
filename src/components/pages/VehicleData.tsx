"use client";

import { useEffect, useMemo, useState } from "react";
import { Car, CheckCircle2, Loader2, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";

const kinds = ["car", "motorcycle", "scooter", "van", "truck", "bus"];

type CatalogResponse = {
  source?: string;
  makes?: string[];
  models?: string[];
  years?: string[];
  variants?: string[];
  specifications?: Record<string, unknown>;
  error?: string;
};

export function VehicleData() {
  const [kind, setKind] = useState("car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [year, setYear] = useState("");
  const [catalog, setCatalog] = useState<CatalogResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadCatalog(params: Record<string, string>) {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/vehicle-catalog?${query}`);
      const data = (await response.json()) as CatalogResponse;
      if (!response.ok) throw new Error(data.error || "Unable to load vehicle data");
      setCatalog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load vehicle data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog({ kind });
    // The catalogue is intentionally loaded again when the vehicle type changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const filteredMakes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (catalog.makes || []).filter((item) => !query || item.toLowerCase().includes(query));
  }, [catalog.makes, search]);

  function chooseMake(value: string) {
    setMake(value);
    setModel("");
    setVariant("");
    setYear("");
    loadCatalog({ kind, make: value });
  }

  function chooseModel(value: string) {
    setModel(value);
    setVariant("");
    setYear("");
    loadCatalog({ kind, make, model: value });
  }

  function chooseVariant(value: string) {
    setVariant(value);
  }

  function chooseYear(value: string) {
    setYear(value);
    loadCatalog({ kind, make, model, year: value });
  }

  const specs = catalog.specifications || {};
  const specEntries = Object.entries(specs).filter(([, value]) => value !== "" && value !== null && value !== undefined);

  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader title="Vehicle Data" description="Brand → Model → Variant → Year → Auto Specifications" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vehicle Catalogue</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select from the live vehicle catalogue instead of typing vehicle names manually.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Source: {catalog.source || "Vehicle catalogue"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Field label="Vehicle Type">
                <select value={kind} onChange={(e) => { setKind(e.target.value); setMake(""); setModel(""); setVariant(""); setYear(""); }} className="input-field">
                  {kinds.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}
                </select>
              </Field>

              <Field label="Brand">
                <select value={make} onChange={(e) => chooseMake(e.target.value)} className="input-field">
                  <option value="">Select brand</option>
                  {filteredMakes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>

              <Field label="Model">
                <select value={model} disabled={!make || loading} onChange={(e) => chooseModel(e.target.value)} className="input-field disabled:bg-gray-100">
                  <option value="">Select model</option>
                  {(catalog.models || []).map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>

              <Field label="Variant">
                <select value={variant} disabled={!model || loading} onChange={(e) => chooseVariant(e.target.value)} className="input-field disabled:bg-gray-100">
                  <option value="">Select variant</option>
                  {(catalog.variants || []).map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>

              <Field label="Year">
                <select value={year} disabled={!model || loading} onChange={(e) => chooseYear(e.target.value)} className="input-field disabled:bg-gray-100">
                  <option value="">Select year</option>
                  {(catalog.years || []).map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." className="input-field pl-9" />
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading catalogue...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Auto Specifications</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {make && model ? `${make} ${model}${variant ? ` • ${variant}` : ""}${year ? ` • ${year}` : ""}` : "Select a vehicle above"}
                </p>
              </div>
              <Car className="w-7 h-7 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            {specEntries.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Select Brand, Model, Variant and Year to load available specifications.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="mt-1 font-semibold text-gray-900 break-words">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Showroom Information</h2>
            <p className="text-sm text-gray-500 mt-1">These are the fields your staff enters for the actual used vehicle.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Registration Number"><input className="input-field" placeholder="OD02AB1234" /></Field>
              <Field label="Running KM"><input type="number" className="input-field" placeholder="35000" /></Field>
              <Field label="Selling Price"><input type="number" className="input-field" placeholder="650000" /></Field>
              <Field label="Purchase Price"><input type="number" className="input-field" placeholder="550000" /></Field>
              <Field label="Condition"><select className="input-field"><option>Excellent</option><option>Good</option><option>Average</option><option>Needs Work</option></select></Field>
              <Field label="Refinance"><select className="input-field"><option>Available</option><option>Not Available</option></select></Field>
            </div>
          </CardContent>
        </Card>

        <button type="button" onClick={() => loadCatalog({ kind, ...(make ? { make } : {}), ...(model ? { model } : {}), ...(year ? { year } : {}) })} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lrs-primary text-white font-medium">
          <RefreshCw className="w-4 h-4" /> Refresh Vehicle Catalogue
        </button>
      </div>

      <style jsx global>{` .input-field { width: 100%; border: 1px solid rgb(229 231 235); border-radius: .5rem; padding: .7rem .8rem; font-size: .875rem; outline: none; background: white; color: rgb(17 24 39); } .input-field:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 10%); } `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>{children}</label>;
}
