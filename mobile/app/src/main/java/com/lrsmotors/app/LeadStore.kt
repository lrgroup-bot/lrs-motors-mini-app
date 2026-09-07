package com.lrsmotors.app

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

data class Lead(val id:Long,val phone:String,val name:String,val type:String,val vehicle:String,val budget:String,val status:String,val notes:String,val followUpAt:Long?,val testDriveAt:Long?,val updatedAt:Long,val actionDueAt:Long?,val actionState:String)
class LeadStore(context:Context):SQLiteOpenHelper(context,"lrs_leads.db",null,2){
 override fun onCreate(db:SQLiteDatabase){db.execSQL("CREATE TABLE leads(id INTEGER PRIMARY KEY AUTOINCREMENT,phone TEXT NOT NULL UNIQUE,name TEXT NOT NULL DEFAULT '',type TEXT NOT NULL DEFAULT 'Car',vehicle TEXT NOT NULL DEFAULT '',budget TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'New',notes TEXT NOT NULL DEFAULT '',follow_up_at INTEGER,test_drive_at INTEGER,updated_at INTEGER NOT NULL,action_due_at INTEGER,action_state TEXT NOT NULL DEFAULT 'NONE')");db.execSQL("CREATE INDEX idx_leads_vehicle ON leads(vehicle)")}
 override fun onUpgrade(db:SQLiteDatabase,o:Int,n:Int){if(o<2){db.execSQL("ALTER TABLE leads ADD COLUMN action_due_at INTEGER");db.execSQL("ALTER TABLE leads ADD COLUMN action_state TEXT NOT NULL DEFAULT 'NONE'")}}
 fun save(phone:String,name:String,type:String,vehicle:String,budget:String,status:String,notes:String,actionDueAt:Long?=null){val p=normalize(phone);require(p.isNotBlank());writableDatabase.execSQL("INSERT INTO leads(phone,name,type,vehicle,budget,status,notes,updated_at,action_due_at,action_state) VALUES(?,?,?,?,?,?,?,?,?,'WAITING') ON CONFLICT(phone) DO UPDATE SET name=excluded.name,type=excluded.type,vehicle=excluded.vehicle,budget=excluded.budget,status=excluded.status,notes=excluded.notes,updated_at=excluded.updated_at,action_due_at=CASE WHEN leads.action_state='NONE' THEN excluded.action_due_at ELSE leads.action_due_at END,action_state=CASE WHEN leads.action_state='NONE' THEN 'WAITING' ELSE leads.action_state END",arrayOf(p,name,type,vehicle,budget,status,notes,System.currentTimeMillis(),actionDueAt))}
 fun setAction(phone:String,state:String)=writableDatabase.execSQL("UPDATE leads SET action_state=? WHERE phone=?",arrayOf(state,normalize(phone)))
 fun delete(phone:String)=writableDatabase.delete("leads","phone=?",arrayOf(normalize(phone)))
 fun find(phone:String):Lead?=readableDatabase.rawQuery("SELECT * FROM leads WHERE phone=?",arrayOf(normalize(phone))).use{c->if(c.moveToFirst())from(c)else null}
 fun all(q0:String=""):List<Lead>{val q="%${q0.trim()}%";return readableDatabase.rawQuery("SELECT * FROM leads WHERE phone LIKE ? OR name LIKE ? OR vehicle LIKE ? OR budget LIKE ? ORDER BY updated_at DESC",arrayOf(q,q,q,q)).use{c->buildList{while(c.moveToNext())add(from(c))}}}
 private fun from(c:android.database.Cursor)=Lead(c.getLong(c.getColumnIndexOrThrow("id")),c.getString(c.getColumnIndexOrThrow("phone")),c.getString(c.getColumnIndexOrThrow("name")),c.getString(c.getColumnIndexOrThrow("type")),c.getString(c.getColumnIndexOrThrow("vehicle")),c.getString(c.getColumnIndexOrThrow("budget")),c.getString(c.getColumnIndexOrThrow("status")),c.getString(c.getColumnIndexOrThrow("notes")),c.longN("follow_up_at"),c.longN("test_drive_at"),c.getLong(c.getColumnIndexOrThrow("updated_at")),c.longN("action_due_at"),c.getString(c.getColumnIndexOrThrow("action_state")))
 private fun android.database.Cursor.longN(n:String):Long?{val i=getColumnIndexOrThrow(n);return if(isNull(i))null else getLong(i)}
 companion object{fun normalize(raw:String):String{val n=raw.filter{it.isDigit()};return if(n.length>10)n.takeLast(10)else n}}
}