package com.lrsmotors.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.CallLog
import android.telecom.TelecomManager
import android.telephony.SubscriptionManager
import androidx.core.content.ContextCompat

data class SimChoice(
    val subscriptionId: Int,
    val slotIndex: Int,
    val label: String,
    val carrier: String,
    val phoneAccountId: String? = null
)

data class ResolvedCall(val phone: String, val subscriptionId: Int?)

object SimCallResolver {
    private const val PREFS = "lead_settings"
    private const val SUB_ID = "subscription_id"
    private const val SLOT = "sim_slot"
    private const val LABEL = "sim_label"
    private const val ACCOUNT = "phone_account_id"

    fun hasPhonePermission(c: Context): Boolean =
        ContextCompat.checkSelfPermission(c, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED

    fun sims(c: Context): List<SimChoice> {
        if (!hasPhonePermission(c)) return emptyList()
        val sm = c.getSystemService(SubscriptionManager::class.java)
        val accounts = try {
            c.getSystemService(TelecomManager::class.java)?.callCapablePhoneAccounts.orEmpty()
        } catch (_: Exception) { emptyList() }

        return try {
            sm.activeSubscriptionInfoList.orEmpty().sortedBy { it.simSlotIndex }.map { info ->
                val carrier = info.carrierName?.toString()?.takeIf { it.isNotBlank() }
                    ?: info.displayName?.toString()?.takeIf { it.isNotBlank() }
                    ?: "Mobile network"
                val accountId = accounts.getOrNull(info.simSlotIndex)?.id
                SimChoice(
                    subscriptionId = info.subscriptionId,
                    slotIndex = info.simSlotIndex,
                    label = "SIM ${info.simSlotIndex + 1} · $carrier",
                    carrier = carrier,
                    phoneAccountId = accountId
                )
            }
        } catch (_: SecurityException) { emptyList() }
    }

    fun selected(c: Context): Int? = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getInt(SUB_ID, Int.MIN_VALUE).takeIf { it != Int.MIN_VALUE }

    fun selectedSlot(c: Context): Int? = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getInt(SLOT, -1).takeIf { it >= 0 }

    fun selectedLabel(c: Context): String = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getString(LABEL, null) ?: "Business SIM"

    fun selectedAccount(c: Context): String? = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getString(ACCOUNT, null)?.takeIf { it.isNotBlank() }

    fun saveSelected(c: Context, sim: SimChoice): Boolean =
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putInt(SUB_ID, sim.subscriptionId)
            .putInt(SLOT, sim.slotIndex)
            .putString(LABEL, sim.label)
            .putString(ACCOUNT, sim.phoneAccountId.orEmpty())
            .commit()

    fun clearSelected(c: Context) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .remove(SUB_ID).remove(SLOT).remove(LABEL).remove(ACCOUNT).apply()
    }

    fun intentMatchesSelectedSim(c: Context, i: Intent): Boolean? {
        val wantedSub = selected(c) ?: return false
        val wantedSlot = selectedSlot(c)
        val keys = listOf("subscription", "subscription_id", "subId", "sub_id", "android.telephony.extra.SUBSCRIPTION_INDEX")
        for (k in keys) if (i.hasExtra(k)) {
            val v = i.getIntExtra(k, Int.MIN_VALUE)
            if (v != Int.MIN_VALUE) return v == wantedSub
        }
        val slotKeys = listOf("slot", "slotId", "slot_id", "simSlot", "simSlotIndex", "phone")
        for (k in slotKeys) if (i.hasExtra(k)) {
            val v = i.getIntExtra(k, Int.MIN_VALUE)
            if (v != Int.MIN_VALUE && wantedSlot != null) return v == wantedSlot
        }
        return null
    }

    fun latestForSelectedSim(c: Context, withinMs: Long = 180000L, allowUnknownAccount: Boolean = false): ResolvedCall? {
        if (ContextCompat.checkSelfPermission(c, Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) return null
        val wantedSub = selected(c) ?: return null
        val wantedSlot = selectedSlot(c)
        val wantedAccount = selectedAccount(c)
        val projection = arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.DATE, CallLog.Calls.PHONE_ACCOUNT_ID)
        return try {
            c.contentResolver.query(CallLog.Calls.CONTENT_URI, projection, null, null, "${CallLog.Calls.DATE} DESC")?.use { cur ->
                val ni = cur.getColumnIndex(CallLog.Calls.NUMBER)
                val di = cur.getColumnIndex(CallLog.Calls.DATE)
                val ai = cur.getColumnIndex(CallLog.Calls.PHONE_ACCOUNT_ID)
                var checked = 0
                while (cur.moveToNext() && checked++ < 20) {
                    val date = cur.getLong(di)
                    if (System.currentTimeMillis() - date > withinMs) break
                    val phone = cur.getString(ni).orEmpty()
                    if (phone.isBlank()) continue
                    val account = if (ai >= 0) cur.getString(ai).orEmpty() else ""
                    val directAccountMatch = !wantedAccount.isNullOrBlank() && account == wantedAccount
                    val subMatch = account == wantedSub.toString()
                    val slotMatch = wantedSlot != null && (
                        account == wantedSlot.toString() ||
                        account.endsWith(":$wantedSlot") ||
                        account.contains("slot$wantedSlot", ignoreCase = true) ||
                        account.contains("sim${wantedSlot + 1}", ignoreCase = true)
                    )
                    if (directAccountMatch || subMatch || slotMatch || (allowUnknownAccount && account.isBlank())) {
                        return ResolvedCall(phone, if (directAccountMatch || subMatch || slotMatch) wantedSub else null)
                    }
                }
                null
            }
        } catch (_: Exception) { null }
    }
}
