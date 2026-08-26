import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readStore, writeStore, type VehicleRecord } from "@/lib/serverStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.vehicles);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.brand?.trim() || !body.model?.trim() || !body.price?.trim()) return NextResponse.json({ error: "Brand, model and price are required." }, { status: 400 });
  const store = await readStore();
  const now = new Date().toISOString();
  const vehicle: VehicleRecord = { id: randomUUID(), brand: body.brand.trim(), model: body.model.trim(), year: String(body.year || ""), km: String(body.km || ""), fuel: body.fuel || "Petrol", transmission: body.transmission || "Manual", price: body.price.trim(), status: body.status || "Available", refinance: Boolean(body.refinance), createdAt: now, updatedAt: now };
  store.vehicles.unshift(vehicle);
  await writeStore(store);
  return NextResponse.json(vehicle, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const store = await readStore();
  const index = store.vehicles.findIndex(v => v.id === body.id);
  if (index < 0) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  store.vehicles[index] = { ...store.vehicles[index], ...body, id: store.vehicles[index].id, updatedAt: new Date().toISOString() };
  await writeStore(store);
  return NextResponse.json(store.vehicles[index]);
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Vehicle id is required." }, { status: 400 });
  const store = await readStore();
  const before = store.vehicles.length;
  store.vehicles = store.vehicles.filter(v => v.id !== id);
  if (before === store.vehicles.length) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
