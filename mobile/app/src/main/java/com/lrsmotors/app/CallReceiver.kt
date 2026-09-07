package com.lrsmotors.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager

class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return
        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val prefs = context.getSharedPreferences("call_state", Context.MODE_PRIVATE)
        val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
        if (!number.isNullOrBlank()) prefs.edit().putString("last_number", number).apply()
        when (state) {
            TelephonyManager.EXTRA_STATE_RINGING, TelephonyManager.EXTRA_STATE_OFFHOOK -> prefs.edit().putBoolean("active", true).apply()
            TelephonyManager.EXTRA_STATE_IDLE -> if (prefs.getBoolean("active", false)) {
                prefs.edit().putBoolean("active", false).apply()
                val phone = prefs.getString("last_number", "").orEmpty()
                if (phone.isNotBlank()) {
                    val launch = Intent(context, MainActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                        putExtra("after_call_phone", phone)
                    }
                    context.startActivity(launch)
                }
            }
        }
    }
}