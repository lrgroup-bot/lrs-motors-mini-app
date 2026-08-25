import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CATALOG_URL =
  "https://cdn.jsdelivr.net/gh/vehiclesdb/vehiclesdb@latest/dist/vehicles.json";

type CatalogVehicle = {
  id?: string;
  make?: string;
  brand?: string;
  model?: string;
  name?: string;
  year?: number | string;
  kind?: string;
  type?: string;
  variant?: string;
  trim?: string;
  variants?: Array<{ name?: string; trim?: string; variant?: string }>;
  fuel?: string[] | string;
  specs?: Record<string, unknown>;
};

let cache: CatalogVehicle[] | null = null;
let cacheAt = 0;

async function getCatalog() {
  const now = Date.now();
  if (cache && now - cacheAt < 6 * 60 * 60 * 1000) return cache;

  const response = await fetch(CATALOG_URL, {
    next: { revalidate: 21600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Vehicle catalogue returned ${response.status}`);

  const json = await response.json();
  const records = Array.isArray(json)
    ? json
    : Array.isArray(json?.vehicles)
      ? json.vehicles
      : Array.isArray(json?.data)
        ? json.data
        : [];

  cache = records as CatalogVehicle[];
  cacheAt = now;
  return cache;
}

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = normalize(searchParams.get("kind") || "car").toLowerCase();
    const make = normalize(searchParams.get("make"));
    const model = normalize(searchParams.get("model"));
    const year = normalize(searchParams.get("year"));
    const q = normalize(searchParams.get("q")).toLowerCase();

    const catalog = await getCatalog();
    const filtered = catalog.filter((item) => {
      const itemKind = normalize(item.kind || item.type).toLowerCase();
      const itemMake = normalize(item.make || item.brand);
      const itemModel = normalize(item.model || item.name);
      const itemYear = normalize(item.year);

      if (kind && itemKind && itemKind !== kind && !(kind === "car" && itemKind === "cars")) return false;
      if (make && itemMake.toLowerCase() !== make.toLowerCase()) return false;
      if (model && itemModel.toLowerCase() !== model.toLowerCase()) return false;
      if (year && itemYear !== year) return false;
      if (q && !`${itemMake} ${itemModel} ${itemYear}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const makes = [...new Set(filtered.map((v) => normalize(v.make || v.brand)).filter(Boolean))].sort();
    const models = [...new Set(filtered.map((v) => normalize(v.model || v.name)).filter(Boolean))].sort();
    const years = [...new Set(filtered.map((v) => normalize(v.year)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));

    const variants = [...new Set(
      filtered.flatMap((v) => [
        v.variant,
        v.trim,
        ...(Array.isArray(v.variants) ? v.variants.flatMap((x) => [x?.name, x?.trim, x?.variant]) : []),
      ]).map(normalize).filter(Boolean)
    )].sort();

    const specifications = filtered[0]
      ? {
          fuel: Array.isArray(filtered[0].fuel) ? filtered[0].fuel.join(", ") : normalize(filtered[0].fuel),
          bodyType: normalize(filtered[0].type),
          ...(filtered[0].specs || {}),
        }
      : {};

    return NextResponse.json({
      source: "VehiclesDB",
      count: filtered.length,
      makes,
      models,
      years,
      variants,
      specifications,
    });
  } catch (error) {
    console.error("Vehicle catalogue error", error);
    return NextResponse.json(
      { error: "Vehicle catalogue is temporarily unavailable." },
      { status: 502 }
    );
  }
}
