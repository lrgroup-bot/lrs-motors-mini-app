"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/Card";
import { Car, FileUp, Loader2, Pencil, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface Vehicle {
  id: string; regNumber: string; make: string; model: string; variant: string; year: number; fuel: string; km: number;
  purchasePrice: number; sellingPrice: number; status: "available" | "reserved" | "sold"; photos: string[];
  hasRC: boolean; hasInsurance: boolean; hasPUCC: boolean;
}

type RcDraft = { regNumber: string; make: string; model: string; variant: string; year: number; fuel: string; km: number; registrationDate: string; ownerName: string; engineNumber: string; chassisNumber: string; sourceText: string };

const mockInventory: Vehicle[] = [
  { id: "1", regNumber: "KA01AB1234", make: "Hyundai", model: "i20", variant: "Sportz Diesel", year: 2021, fuel: "Diesel", km: 45000, purchasePrice: 550000, sellingPrice: 650000, status: "available", photos: [], hasRC: true, hasInsurance: true, hasPUCC: true },
  { id: "2", regNumber: "KA02BC5678", make: "Toyota", model: "Fortuner", variant: "4x4 Manual", year: 2019, fuel: "Diesel", km: 62000, purchasePrice: 1000000, sellingPrice: 1200000, status: "available", photos: [], hasRC: true, hasInsurance: true, hasPUCC: false },
  { id: "3", regNumber: "KA03CD9012", make: "Maruti", model: "Swift", variant: "VXi Petrol", year: 2020, fuel: "Petrol", km: 32000, purchasePrice: 420000, sellingPrice: 480000, status: "reserved", photos: [], hasRC: true, hasInsurance: true, hasPUCC: true },
  { id: "4", regNumber: "KA04DE3456", make: "Hyundai", model: "Creta", variant: "SX Automatic", year: 2022, fuel: "Petrol", km: 8000, purchasePrice: 950000, sellingPrice: 1050000, status: "available", photos: [], hasRC: true, hasInsurance: true, hasPUCC: true },
];
const statusColors = { available: "bg-green-100 text-green-700", reserved: "bg-yellow-100 text-yellow-700", sold: "bg-gray-100 text-gray-700" };
const makes = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Kia", "Volkswagen", "Skoda", "Renault", "Nissan", "MG", "Ford", "Other"];
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const years = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i);

function field(text: string, patterns: RegExp[]) { for (const p of patterns) { const m = text.match(p); if (m?.[1]) return m[1].trim().replace(/\s{2,}/g, " "); } return ""; }
function parseRc(text: string) {
  const normalized = text.replace(/\r/g, "\n").replace(/[|]/g, " ");
  const make = makes.find(x => new RegExp(`\\b${x.replace(" ", "\\s+")}\\b`, "i").test(normalized)) || "";
  const year = normalized.match(/\b(20(?:0[0-9]|1[0-9]|2[0-9]))\b/);
  const regNumber = field(normalized, [/(?:registration|regn?\.?|reg(?:istration)?\s*no)\s*[:\-]?\s*([A-Z]{2}\s*[- ]?\s*\d{1,2}\s*[- ]?\s*[A-Z]{0,3}\s*[- ]?\s*\d{1,4})/i, /\b([A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4})\b/i]);
  const fuel = fuelTypes.find(x => new RegExp(`\\b${x}\\b`, "i").test(normalized)) || "";
  const kmText = field(normalized, [/(?:odometer|kilometers?|km)\s*[:\-]?\s*([0-9,]{2,8})/i]);
  return { regNumber, make, model: field(normalized, [/(?:model)\s*[:\-]?\s*([^\n]{2,40})/i]), variant: field(normalized, [/(?:variant|version)\s*[:\-]?\s*([^\n]{2,50})/i]), year: year ? Number(year[1]) : new Date().getFullYear(), fuel, km: Number((kmText || "0").replace(/,/g, "")), ownerName: field(normalized, [/(?:owner(?:\s*name)?|registered\s*owner)\s*[:\-]?\s*([^\n]{2,60})/i]), registrationDate: field(normalized, [/(?:registration\s*date|date\s*of\s*registration)\s*[:\-]?\s*([0-9]{1,2}[\/-][0-9]{1,2}[\/-][0-9]{2,4})/i]), engineNumber: field(normalized, [/(?:engine(?:\s*no|\s*number)?)\s*[:\-]?\s*([A-Z0-9]{5,25})/i]), chassisNumber: field(normalized, [/(?:chassis(?:\s*no|\s*number)?)\s*[:\-]?\s*([A-Z0-9]{8,30})/i]), sourceText: text };
}

export function Inventory() {
  const [filter, setFilter] = useState<"all" | "available" | "reserved" | "sold">("all");
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockInventory);
  const [showRcImporter, setShowRcImporter] = useState(false), [isProcessing, setIsProcessing] = useState(false), [progress, setProgress] = useState(0), [error, setError] = useState(""), [draft, setDraft] = useState<RcDraft | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => filter === "all" ? vehicles : vehicles.filter(v => v.status === filter), [filter, vehicles]);

  async function handleRcUpload(file: File) {
    setError(""); setDraft(null); setIsProcessing(true); setProgress(5);
    try {
      if (file.type !== "application/pdf") throw new Error("Please upload a PDF RC document.");
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng"); let text = "";
      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        const page = await pdf.getPage(pageNo), viewport = page.getViewport({ scale: 2 }), canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height; const context = canvas.getContext("2d"); if (!context) continue;
        await page.render({ canvasContext: context, viewport }).promise; const result = await worker.recognize(canvas); text += `\n${result.data.text}`; setProgress(Math.min(90, Math.round(pageNo / pdf.numPages * 90)));
      }
      await worker.terminate(); setDraft(parseRc(text)); setProgress(100);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not read the RC PDF."); } finally { setIsProcessing(false); }
  }
  function saveVehicle() {
    if (!draft) return;
    setVehicles(prev => [{ id: crypto.randomUUID(), regNumber: draft.regNumber, make: draft.make || "Other", model: draft.model || "Manual review", variant: draft.variant || "Not specified", year: draft.year, fuel: draft.fuel || "Petrol", km: draft.km || 0, purchasePrice: 0, sellingPrice: 0, status: "available", photos: [], hasRC: true, hasInsurance: false, hasPUCC: false }, ...prev]);
    setDraft(null); setShowRcImporter(false);
  }

  return <div className="min-h-screen bg-lrs-light"><PageHeader title="Inventory" description="Manage your vehicle inventory" /><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><div className="flex flex-wrap gap-2">{["all", "available", "reserved", "sold"].map(status => <button key={status} onClick={() => setFilter(status as typeof filter)} className={`px-4 py-2 rounded-lg font-medium ${filter === status ? "bg-lrs-blue text-white" : "bg-white border border-gray-200 text-gray-700"}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>)}</div><button onClick={() => { setShowRcImporter(true); setError(""); }} className="inline-flex items-center gap-2 rounded-lg bg-lrs-blue px-4 py-2.5 font-semibold text-white"><FileUp className="w-4 h-4" /> Upload RC PDF</button></div>
    <div className="space-y-4">{filtered.map(v => <Card key={v.id}><CardContent className="p-0"><div className="flex flex-col md:flex-row gap-4 p-6"><div className="w-full md:w-48 h-40 bg-gray-200 rounded-lg flex items-center justify-center"><Car className="w-12 h-12 text-gray-400" /></div><div className="flex-1"><div className="flex items-start justify-between mb-3"><div><h3 className="text-xl font-semibold text-gray-900">{v.year} {v.make} {v.model}</h3><p className="text-sm text-gray-500">{v.variant}</p></div><span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[v.status]}`}>{v.status}</span></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200"><div><p className="text-xs text-gray-500">REGISTRATION</p><p className="font-semibold">{v.regNumber || "—"}</p></div><div><p className="text-xs text-gray-500">FUEL</p><p className="font-semibold">{v.fuel}</p></div><div><p className="text-xs text-gray-500">KILOMETERS</p><p className="font-semibold">{v.km.toLocaleString()} km</p></div><div><p className="text-xs text-gray-500">YEAR</p><p className="font-semibold">{v.year}</p></div></div><div className="flex justify-between pt-4"><div><p className="text-xs text-gray-500">SELLING PRICE</p><p className="font-semibold text-lrs-blue text-lg">₹{(v.sellingPrice / 100000).toFixed(2)}L</p></div><div className="flex gap-2">{[{ label: "RC", has: v.hasRC }, { label: "Insurance", has: v.hasInsurance }, { label: "PUCC", has: v.hasPUCC }].map(d => <span key={d.label} className={`text-xs px-2 py-1 rounded ${d.has ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{d.label}</span>)}</div></div></div></div></CardContent></Card>)}</div>
  </div>
  {showRcImporter && <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto"><div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-2xl overflow-hidden"><div className="flex justify-between p-5 border-b"><div><h2 className="text-xl font-bold">RC PDF Import</h2><p className="text-sm text-gray-500">Upload → OCR → verify → edit → save</p></div><button onClick={() => setShowRcImporter(false)}><X /></button></div><div className="p-5">
    {!draft && <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center"><FileUp className="w-12 h-12 mx-auto text-lrs-blue mb-3" /><h3 className="font-semibold text-lg">Upload RC PDF</h3><p className="text-sm text-gray-500 mb-5">Supports scanned/photo RC PDFs using OCR.</p><input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleRcUpload(e.target.files[0])} /><button disabled={isProcessing} onClick={() => fileRef.current?.click()} className="rounded-lg bg-lrs-blue text-white px-5 py-2.5 font-semibold disabled:opacity-60">{isProcessing ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Reading RC…</span> : "Choose RC PDF"}</button>{isProcessing && <div className="mt-5"><div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-lrs-blue rounded-full" style={{ width: `${progress}%` }} /></div><p className="text-xs text-gray-500 mt-2">OCR progress: {progress}%</p></div>}</div>}
    {error && <div className="mt-4 flex gap-2 rounded-lg bg-red-50 text-red-700 p-3 text-sm"><AlertCircle className="w-5 h-5" />{error}</div>}
    {draft && <div><div className="flex gap-2 rounded-lg bg-green-50 text-green-700 p-3 text-sm mb-5"><CheckCircle2 className="w-5 h-5" />RC processed. Verify every field before saving.</div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{([ ["regNumber","Registration Number"], ["ownerName","Owner Name"], ["make","Brand"], ["model","Model"], ["variant","Variant"], ["year","Year"], ["fuel","Fuel Type"], ["km","Kilometers"], ["registrationDate","Registration Date"], ["engineNumber","Engine Number"], ["chassisNumber","Chassis Number"] ] as const).map(([key,label]) => <label key={key} className="block"><span className="text-sm font-medium text-gray-700">{label}</span>{key === "make" ? <select value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5">{["",...makes].map(x => <option key={x}>{x}</option>)}</select> : key === "fuel" ? <select value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5">{["",...fuelTypes].map(x => <option key={x}>{x}</option>)}</select> : key === "year" ? <select value={draft[key]} onChange={e => setDraft({ ...draft, year: Number(e.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2.5">{years.map(x => <option key={x}>{x}</option>)}</select> : <input value={draft[key]} onChange={e => setDraft({ ...draft, [key]: key === "km" ? Number(e.target.value) : e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5" />}</label>)}</div><div className="mt-5 rounded-lg bg-gray-50 p-4"><p className="text-xs font-semibold text-gray-500">OCR SOURCE TEXT</p><pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-gray-600">{draft.sourceText}</pre></div><div className="flex justify-end gap-3 mt-5"><button onClick={() => setDraft(null)} className="px-4 py-2 rounded-lg border">Re-upload</button><button onClick={saveVehicle} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-lrs-blue text-white font-semibold"><Pencil className="w-4 h-4" /> Verify & Save Vehicle</button></div></div>}
  </div></div></div>}
  </div>;
}
