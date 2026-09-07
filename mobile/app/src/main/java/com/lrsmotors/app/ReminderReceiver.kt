package com.lrsmotors.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val phone=intent.getStringExtra("phone") ?: return
        val vehicle=intent.getStringExtra("vehicle").orEmpty()
        val manager=context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(NotificationChannel("followups","Lead follow-ups",NotificationManager.IMPORTANCE_HIGH))
        val open=PendingIntent.getActivity(context, phone.hashCode(), Intent(context,MainActivity::class.java).putExtra("after_call_phone",phone), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n=NotificationCompat.Builder(context,"followups").setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle("LRS Lead follow-up").setContentText("Call $phone${if(vehicle.isBlank()) "" else " · $vehicle"}").setAutoCancel(true).setContentIntent(open).build()
        manager.notify(phone.hashCode(),n)
    }
}