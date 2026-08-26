"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { Car, Loader2, LogOut, Plus, Search, Trash2 } from "lucide-react";

type VehicleStatus = "Available" | "Reserved" | "Sold" | "Service";
type Vehicle = { id:string; brand:string; model:string; year:string; km:string; fuel:string; transmission:string; price:string; status:VehicleStatus; refinance:boolean };
type VehicleForm = Omit<Vehicle,"id">;
const emptyVehicle: VehicleForm = { brand:"", model:"", year:"", km:"", fuel:"Petrol", transmission:"Manual", price:"", status:"Available", refinance:true };

export function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [vehicles,setVehicles]=useState<Vehicle[]>([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(""); const [search,setSearch]=useState(""); const [form,setForm]=useState<VehicleForm>(emptyVehicle); const [editingId,setEditingId]=useState<string|null>(null); const [showModal,setShowModal]=useState(false);

  async function loadVehicles(){ try { const r=await fetch("/api/vehicles",{cache:"no-store"}); if(!r.ok) throw new Error("Could not load server inventory."); setVehicles(await r.json()); } catch(e){setError(e instanceof Error?e.message:"Could not load inventory.");} finally{setLoading(false);} }
  useEffect(()=>{ if(isLoading)return; if(!isAuthenticated){window.location.href="/login";return;} loadVehicles(); },[isAuthenticated,isLoading]);

  const filtered=useMemo(()=>{const q=search.toLowerCase().trim();return vehicles.filter(v=>!q||`${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(q));},[vehicles,search]);
  const counts=useMemo(()=>({total:vehicles.length,available:vehicles.filter(v=>v.status==="Available").length,sold:vehicles.filter(v=>v.status==="Sold").length}),[vehicles]);

  async function saveVehicle(e:FormEvent){e.preventDefault();setSaving(true);setError("");try{const method=editingId?"PUT":"POST";const body=editingId?{id:editingId,...form}:form;const r=await fetch("/api/vehicles",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error||"Could not save vehicle.");await loadVehicles();setShowModal(false);setEditingId(null);setForm(emptyVehicle);}catch(e){setError(e instanceof Error?e.message:"Could not save vehicle.");}finally{setSaving(false);}}
  async function remove(id:string){if(!confirm("Delete this vehicle from inventory?"))return;const r=await fetch(`/api/vehicles?id=${encodeURIComponent(id)}`,{method:"DELETE"});if(r.ok)await loadVehicles();else setError("Could not delete vehicle.");}
  async function changeStatus(v:Vehicle,status:VehicleStatus){const r=await fetch("/api/vehicles",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...v,status})});if(r.ok)await loadVehicles();else setError("Could not update status.");}
  function edit(v:Vehicle){setEditingId(v.id);setForm({brand:v.brand,model:v.model,year:v.year,km:v.km,fuel:v.fuel,transmission:v.transmission,price:v.price,status:v.status,refinance:v.refinance});setShowModal(true);}

  if(isLoading||loading)return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>;
  return <div className="min-h-screen bg-lrs-light"><PageHeader title="Dashboard" description="LRS Motors PC Server"/><div className="max-w-7xl mx-auto p-6 space-y-6">
    <div className="bg-white border rounded-xl p-4 flex justify-between items-center"><div><div className="text-xs text-gray-500">Signed in</div><div className="font-medium">{user?.email||user?.name}</div></div><button onClick={logout} className="px-4 py-2 bg-gray-100 rounded-lg flex gap-2"><LogOut className="w-4 h-4"/>Sign Out</button></div>
    {error&&<div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}
    <div className="grid sm:grid-cols-3 gap-4"><Summary label="Total Vehicles" value={counts.total}/><Summary label="Available" value={counts.available}/><Summary label="Sold" value={counts.sold}/></div>
    <div className="bg-white border rounded-xl p-5"><div className="flex flex-col sm:flex-row gap-3 justify-between mb-5"><div><h2 className="text-xl font-bold">Vehicle Inventory</h2><p className="text-sm text-gray-500">Persistent data stored by this PC server</p></div><button onClick={()=>{setEditingId(null);setForm(emptyVehicle);setShowModal(true)}} className="px-4 py-2 bg-lrs-primary text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/>Add Vehicle</button></div><div className="relative mb-5"><Search className="absolute left-3 top-3 w-5 h-5 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inventory" className="w-full border rounded-lg py-2.5 pl-10 pr-3"/></div>
    {filtered.length===0?<div className="py-12 text-center text-gray-500"><Car className="w-12 h-12 mx-auto mb-3 text-gray-300"/>No vehicles in server inventory.</div>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(v=><div key={v.id} className="border rounded-xl p-4"><div className="font-bold text-lg">{v.brand} {v.model}</div><div className="text-sm text-gray-500">{v.year} • {v.km} KM • {v.fuel} • {v.transmission}</div><div className="font-semibold mt-3">₹{v.price}</div><select value={v.status} onChange={e=>changeStatus(v,e.target.value as VehicleStatus)} className="border rounded-lg p-2 w-full mt-3"><option>Available</option><option>Reserved</option><option>Sold</option><option>Service</option></select><div className="flex gap-2 mt-3"><button onClick={()=>edit(v)} className="flex-1 bg-gray-100 rounded-lg p-2">Edit</button><button onClick={()=>remove(v.id)} className="bg-red-50 text-red-600 rounded-lg p-2"><Trash2 className="w-4 h-4"/></button></div></div>)}</div>}</div>
  </div>
  {showModal&&<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><form onSubmit={saveVehicle} className="bg-white rounded-xl p-5 w-full max-w-xl space-y-3"><h2 className="text-xl font-bold">{editingId?"Edit Vehicle":"Add Vehicle"}</h2><div className="grid sm:grid-cols-2 gap-3"><Input label="Brand" value={form.brand} set={x=>setForm({...form,brand:x})}/><Input label="Model" value={form.model} set={x=>setForm({...form,model:x})}/><Input label="Year" value={form.year} set={x=>setForm({...form,year:x})}/><Input label="Running KM" value={form.km} set={x=>setForm({...form,km:x})}/><Input label="Fuel" value={form.fuel} set={x=>setForm({...form,fuel:x})}/><Input label="Transmission" value={form.transmission} set={x=>setForm({...form,transmission:x})}/><Input label="Price" value={form.price} set={x=>setForm({...form,price:x})}/></div><div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button disabled={saving} className="px-4 py-2 bg-lrs-primary text-white rounded-lg">{saving?"Saving...":"Save Vehicle"}</button></div></form></div>}</div>;
}
function Summary({label,value}:{label:string;value:number}){return <div className="bg-white border rounded-xl p-5"><div className="text-sm text-gray-500">{label}</div><div className="text-3xl font-bold mt-1">{value}</div></div>}
function Input({label,value,set}:{label:string;value:string;set:(x:string)=>void}){return <label className="text-sm">{label}<input required={label==="Brand"||label==="Model"||label==="Price"} value={value} onChange={e=>set(e.target.value)} className="block w-full border rounded-lg p-2 mt-1"/></label>}
