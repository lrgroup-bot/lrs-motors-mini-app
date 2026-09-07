package com.lrsmotors.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.telephony.TelephonyManager
import androidx.core.app.NotificationCompat

class CallReceiver:BroadcastReceiver(){
 override fun onReceive(c:Context,i:Intent){
  if(i.action!=TelephonyManager.ACTION_PHONE_STATE_CHANGED)return
  val state=i.getStringExtra(TelephonyManager.EXTRA_STATE)?:return
  val pref=c.getSharedPreferences("call_state",Context.MODE_PRIVATE)
  val simMatch=SimCallResolver.intentMatchesSelectedSim(c,i)
  when(state){
   TelephonyManager.EXTRA_STATE_RINGING,TelephonyManager.EXTRA_STATE_OFFHOOK->{
    if(simMatch==false)return
    pref.edit().putBoolean("active",true).putBoolean("selected_sim_confirmed",simMatch==true).apply()
   }
   TelephonyManager.EXTRA_STATE_IDLE->{
    if(!pref.getBoolean("active",false))return
    val confirmed=pref.getBoolean("selected_sim_confirmed",false)
    pref.edit().putBoolean("active",false).putBoolean("selected_sim_confirmed",false).apply()
    Handler(Looper.getMainLooper()).postDelayed({
     val call=SimCallResolver.latestForSelectedSim(c,180000L,allowUnknownAccount=confirmed)?:return@postDelayed
     val p=LeadStore.normalize(call.phone);if(p.isBlank())return@postDelayed
     val pending=pref.getString("pending_followup_call","").orEmpty()
     if(pending.isNotBlank()&&LeadStore.normalize(pending)==p){LeadStore(c).setAction(p,"DONE");pref.edit().remove("pending_followup_call").apply();return@postDelayed}
     val nm=c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
     nm.createNotificationChannel(NotificationChannel("new_calls","New customer call leads",NotificationManager.IMPORTANCE_HIGH))
     val open=PendingIntent.getActivity(c,p.hashCode(),Intent(c,MainActivity::class.java).putExtra("after_call_phone",p).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
     nm.notify(p.hashCode(),NotificationCompat.Builder(c,"new_calls").setSmallIcon(android.R.drawable.sym_action_call).setContentTitle("Leads/Reminder · Save this caller?").setContentText("$p · tap to add Car/Bike requirement").setPriority(NotificationCompat.PRIORITY_MAX).setAutoCancel(true).setContentIntent(open).build())
    },3000)
   }
  }
 }
}
