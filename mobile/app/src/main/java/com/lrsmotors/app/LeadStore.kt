package com.lrsmotors.app

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

data class Lead(
    val id: Long,
    val phone: String,
    val name: String,
    val type: String,
    val vehicle: String,
    val budget: String,
    val status: String,
    val notes: String,
    val followUpAt: Long?,
    val testDriveAt: Long?,
    val updatedAt: Long
)

class LeadStore(context: Context) : SQLiteOpenHelper(context, "lrs_leads.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""CREATE TABLE leads(id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'Car', vehicle TEXT NOT NULL DEFAULT '', budget TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'New', notes TEXT NOT NULL DEFAULT '', follow_up_at INTEGER, test_drive_at INTEGER, updated_at INTEGER NOT NULL)""")
        db.execSQL("CREATE INDEX idx_leads_followup ON leads(follow_up_at)")
        db.execSQL("CREATE INDEX idx_leads_vehicle ON leads(vehicle)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) = Unit

    fun save(phone: String, name: String, type: String, vehicle: String, budget: String, status: String, notes: String, followUpAt: Long? = null, testDriveAt: Long? = null) {
        val p = normalize(phone)
        writableDatabase.execSQL("""INSERT INTO leads(phone,name,type,vehicle,budget,status,notes,follow_up_at,test_drive_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(phone) DO UPDATE SET name=excluded.name,type=excluded.type,vehicle=excluded.vehicle,budget=excluded.budget,status=excluded.status,notes=excluded.notes,follow_up_at=COALESCE(excluded.follow_up_at,leads.follow_up_at),test_drive_at=COALESCE(excluded.test_drive_at,leads.test_drive_at),updated_at=excluded.updated_at""", arrayOf(p,name,type,vehicle,budget,status,notes,followUpAt,testDriveAt,System.currentTimeMillis()))
    }

    fun find(phone: String): Lead? {
        readableDatabase.rawQuery("SELECT * FROM leads WHERE phone=?", arrayOf(normalize(phone))).use { c ->
            return if (c.moveToFirst()) from(c) else null
        }
    }

    fun all(query: String = ""): List<Lead> {
        val q = "%${query.trim()}%"
        readableDatabase.rawQuery("SELECT * FROM leads WHERE phone LIKE ? OR name LIKE ? OR vehicle LIKE ? OR budget LIKE ? ORDER BY updated_at DESC", arrayOf(q,q,q,q)).use { c ->
            val out = mutableListOf<Lead>(); while(c.moveToNext()) out += from(c); return out
        }
    }

    fun due(now: Long = System.currentTimeMillis()): List<Lead> {
        readableDatabase.rawQuery("SELECT * FROM leads WHERE follow_up_at IS NOT NULL AND follow_up_at<=? AND status NOT IN ('Purchased','Lost') ORDER BY follow_up_at", arrayOf(now.toString())).use { c ->
            val out= mutableListOf<Lead>(); while(c.moveToNext()) out += from(c); return out
        }
    }

    private fun from(c: android.database.Cursor) = Lead(c.getLong(c.getColumnIndexOrThrow("id")),c.getString(c.getColumnIndexOrThrow("phone")),c.getString(c.getColumnIndexOrThrow("name")),c.getString(c.getColumnIndexOrThrow("type")),c.getString(c.getColumnIndexOrThrow("vehicle")),c.getString(c.getColumnIndexOrThrow("budget")),c.getString(c.getColumnIndexOrThrow("status")),c.getString(c.getColumnIndexOrThrow("notes")),c.getLongOrNull("follow_up_at"),c.getLongOrNull("test_drive_at"),c.getLong(c.getColumnIndexOrThrow("updated_at")))
    private fun android.database.Cursor.getLongOrNull(name:String):Long? { val i=getColumnIndexOrThrow(name); return if(isNull(i)) null else getLong(i) }
    companion object { fun normalize(raw:String):String { val n=raw.filter{it.isDigit()}; return if(n.length>10) n.takeLast(10) else n } }
}