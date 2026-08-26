import { promises as fs } from "fs";
import path from "path";

export type VehicleRecord = {
  id: string;
  brand: string;
  model: string;
  year: string;
  km: string;
  fuel: string;
  transmission: string;
  price: string;
  status: "Available" | "Reserved" | "Sold" | "Service";
  refinance: boolean;
  createdAt: string;
  updatedAt: string;
};

type Store = { vehicles: VehicleRecord[]; customers: unknown[]; sales: unknown[]; documents: unknown[] };

const dataRoot = process.env.LRS_DATA_DIR || path.join(process.cwd(), "data");
const storePath = path.join(dataRoot, "lrs-motors.json");
const emptyStore: Store = { vehicles: [], customers: [], sales: [], documents: [] };

async function ensureStore() {
  await fs.mkdir(dataRoot, { recursive: true });
  try { await fs.access(storePath); }
  catch { await fs.writeFile(storePath, JSON.stringify(emptyStore, null, 2), "utf8"); }
}

export async function readStore(): Promise<Store> {
  await ensureStore();
  try { return JSON.parse(await fs.readFile(storePath, "utf8")) as Store; }
  catch { return { ...emptyStore, vehicles: [] }; }
}

export async function writeStore(store: Store) {
  await ensureStore();
  const temp = `${storePath}.tmp`;
  await fs.writeFile(temp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(temp, storePath);
}

export function getDataRoot() { return dataRoot; }
