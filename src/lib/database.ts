import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = process.env.LRS_DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "lrs-motors.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS vehicles (
 id TEXT PRIMARY KEY,
 registration_number TEXT UNIQUE,
 make TEXT NOT NULL,
 model TEXT NOT NULL,
 variant TEXT,
 year INTEGER,
 fuel TEXT,
 transmission TEXT,
 kilometers INTEGER DEFAULT 0,
 purchase_price INTEGER DEFAULT 0,
 selling_price INTEGER DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','reserved','sold','service')),
 owner_name TEXT,
 registration_date TEXT,
 engine_number TEXT,
 chassis_number TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS customers (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 phone TEXT,
 email TEXT,
 address TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reservations (
 id TEXT PRIMARY KEY,
 vehicle_id TEXT NOT NULL,
 customer_id TEXT NOT NULL,
 selling_price INTEGER NOT NULL,
 booking_amount INTEGER NOT NULL DEFAULT 0,
 balance_amount INTEGER NOT NULL DEFAULT 0,
 booking_date TEXT NOT NULL,
 balance_due_date TEXT,
 payment_method TEXT,
 payment_reference TEXT,
 notes TEXT,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
 FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS payments (
 id TEXT PRIMARY KEY,
 reservation_id TEXT NOT NULL,
 amount INTEGER NOT NULL,
 payment_date TEXT NOT NULL,
 payment_method TEXT,
 payment_reference TEXT,
 notes TEXT,
 created_at TEXT NOT NULL,
 FOREIGN KEY(reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS documents (
 id TEXT PRIMARY KEY,
 vehicle_id TEXT,
 document_type TEXT NOT NULL,
 file_name TEXT NOT NULL,
 file_path TEXT NOT NULL,
 uploaded_at TEXT NOT NULL,
 FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_due ON reservations(balance_due_date);
`);

export { db, dbPath, dataDir };
