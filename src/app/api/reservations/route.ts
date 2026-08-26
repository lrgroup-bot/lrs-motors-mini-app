import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db.prepare(`SELECT r.*, c.name customer_name, c.phone customer_phone, v.registration_number, v.make, v.model FROM reservations r JOIN customers c ON c.id=r.customer_id JOIN vehicles v ON v.id=r.vehicle_id ORDER BY r.created_at DESC`).all();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const b = await request.json();
  if (!b.vehicleId || !b.customerName || !b.sellingPrice) return NextResponse.json({ error: "Vehicle, customer and selling price are required." }, { status: 400 });
  const sellingPrice = Number(b.sellingPrice), bookingAmount = Number(b.bookingAmount || 0);
  if (bookingAmount < 0 || bookingAmount > sellingPrice) return NextResponse.json({ error: "Booking amount must be between 0 and selling price." }, { status: 400 });
  const now = new Date().toISOString(), customerId = randomUUID(), reservationId = randomUUID();
  const transaction = db.transaction(() => {
    db.prepare(`INSERT INTO customers(id,name,phone,email,address,created_at,updated_at) VALUES(?,?,?,?,?,?,?)`).run(customerId,b.customerName,b.customerPhone||null,b.customerEmail||null,b.customerAddress||null,now,now);
    db.prepare(`INSERT INTO reservations(id,vehicle_id,customer_id,selling_price,booking_amount,balance_amount,booking_date,balance_due_date,payment_method,payment_reference,notes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(reservationId,b.vehicleId,customerId,sellingPrice,bookingAmount,sellingPrice-bookingAmount,b.bookingDate||now.slice(0,10),b.balanceDueDate||null,b.paymentMethod||null,b.paymentReference||null,b.notes||null,"active",now,now);
    if (bookingAmount > 0) db.prepare(`INSERT INTO payments(id,reservation_id,amount,payment_date,payment_method,payment_reference,notes,created_at) VALUES(?,?,?,?,?,?,?,?)`).run(randomUUID(),reservationId,bookingAmount,b.bookingDate||now.slice(0,10),b.paymentMethod||null,b.paymentReference||null,"Booking payment",now);
    db.prepare(`UPDATE vehicles SET status='reserved', selling_price=?, updated_at=? WHERE id=?`).run(sellingPrice,now,b.vehicleId);
  });
  transaction();
  return NextResponse.json({ id: reservationId, balanceAmount: sellingPrice-bookingAmount }, { status: 201 });
}
