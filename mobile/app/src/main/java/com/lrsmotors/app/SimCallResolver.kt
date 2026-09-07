package com.lrsmotors.app

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CallLog
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import androidx.core.content.ContextCompat

data class SimChoice(val subscriptionId:Int,val slotIndex:Int,val label:String)
data class ResolvedCall(val phone:String,val subscriptionId:Int?)

object SimCallResolver {
 fun sims(c:Context):List<SimChoice>{
  if(ContextCompat.checkSelfPermission(c,Manifest.permission.READ_PHONE_STATE)!=PackageManager.PERMISSION_GRANTED)return emptyList()
  val sm=c.getSystemService(SubscriptionManager::class.java)
  return try{sm.activeSubscriptionInfoList.orEmpty().map{SimChoice(it.subscriptionId,it.simSlotIndex,"SIM ${it.simSlotIndex+1} · ${it.displayName}")}}catch(_:SecurityException){emptyList()}
 }
 fun selected(c:Context)=c.getSharedPreferences("lead_settings",Context.MODE_PRIVATE).getInt("subscription_id",Int.MIN_VALUE).takeIf{it!=Int.MIN_VALUE}
 fun saveSelected(c:Context,id:Int)=c.getSharedPreferences("lead_settings",Context.MODE_PRIVATE).edit().putInt("subscription_id",id).apply()
 fun latestForSelectedSim(c:Context,withinMs:Long=120000L):ResolvedCall?{
  if(ContextCompat.checkSelfPermission(c,Manifest.permission.READ_CALL_LOG)!=PackageManager.PERMISSION_GRANTED)return null
  val wanted=selected(c)?:return null
  val projection=arrayOf(CallLog.Calls.NUMBER,CallLog.Calls.DATE,CallLog.Calls.PHONE_ACCOUNT_ID)
  return try{c.contentResolver.query(CallLog.Calls.CONTENT_URI,projection,null,null,"${CallLog.Calls.DATE} DESC")?.use{cur->
   val ni=cur.getColumnIndex(CallLog.Calls.NUMBER);val di=cur.getColumnIndex(CallLog.Calls.DATE);val ai=cur.getColumnIndex(CallLog.Calls.PHONE_ACCOUNT_ID)
   var checked=0
   while(cur.moveToNext()&&checked++<8){val date=cur.getLong(di);if(System.currentTimeMillis()-date>withinMs)break;val account=if(ai>=0)cur.getString(ai) else null;val sub=account?.toIntOrNull();if(sub==wanted)return ResolvedCall(cur.getString(ni),sub)}
   null
  }}catch(_:Exception){null}
 }
}