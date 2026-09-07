package com.lrsmotors.app

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.max
import kotlin.math.min

private val Navy=Color(0xFF07111F); private val Card=Color(0xFF142235); private val Green=Color(0xFF28D76F); private val Red=Color(0xFFFF3F4B); private val Blue=Color(0xFF1478F2); private val Muted=Color(0xFFB8C1CE)

class MainActivity:ComponentActivity(){private val perms=registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()){recreate()};override fun onCreate(b:Bundle?){super.onCreate(b);perms.launch(arrayOf(Manifest.permission.READ_PHONE_STATE,Manifest.permission.READ_CALL_LOG,Manifest.permission.READ_PHONE_NUMBERS,Manifest.permission.CALL_PHONE,Manifest.permission.POST_NOTIFICATIONS));val phone=intent.getStringExtra("action_phone")?:intent.getStringExtra("after_call_phone");setContent{App(this,phone)}}}
@Composable fun App(c:Context,initial:String?){val store=remember{LeadStore(c)};val sims=remember{SimCallResolver.sims(c)};var page by remember{mutableStateOf(if(SimCallResolver.selected(c)==null)"setup" else if(initial.isNullOrBlank())"dash" else "add")};var refresh by remember{mutableIntStateOf(0)};MaterialTheme(colorScheme=darkColorScheme(background=Navy,surface=Card,primary=Blue)){when(page){"setup"->Setup(c,sims){page="dash"};"add"->AddLead(c,store,initial.orEmpty()){refresh++;page="dash"};else->Dashboard(c,store,refresh){refresh++}}}}
@Composable fun Setup(c:Context,sims:List<SimChoice>,done:()->Unit){Column(Modifier.fillMaxSize().background(Navy).padding(24.dp),verticalArrangement=Arrangement.Center){Brand();Spacer(Modifier.height(30.dp));Text("Select Business SIM",fontSize=22.sp,fontWeight=FontWeight.Bold);Text("Only calls from this SIM will create customer leads.",color=Muted);Spacer(Modifier.height(18.dp));sims.forEach{Button({SimCallResolver.saveSelected(c,it.subscriptionId);done()},Modifier.fillMaxWidth().padding(vertical=6.dp).height(58.dp),shape=RoundedCornerShape(16.dp)){Text(it.label)}}}}
@Composable fun Brand(){Column(horizontalAlignment=Alignment.CenterHorizontally,modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.DirectionsCar,null,tint=Color.White,modifier=Modifier.size(52.dp));Text("LRS MOTORS",fontSize=30.sp,fontWeight=FontWeight.Black);Text("DRIVE YOUR DREAM",fontSize=10.sp,letterSpacing=4.sp,color=Muted)}}
@Composable fun Dashboard(c:Context,store:LeadStore,key:Int,refresh:()->Unit){val leads=remember(key){store.all()};LazyColumn(Modifier.fillMaxSize().background(Navy).padding(horizontal=16.dp),contentPadding=PaddingValues(top=22.dp,bottom=30.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){item{Brand();Spacer(Modifier.height(12.dp));Text("Dashboard",fontSize=28.sp,fontWeight=FontWeight.Bold);Text("Sales Lead Tracker",color=Muted);Spacer(Modifier.height(14.dp));ElevatedCard(Modifier.fillMaxWidth().shadow(12.dp,RoundedCornerShape(22.dp)),shape=RoundedCornerShape(22.dp),colors=CardDefaults.elevatedCardColors(containerColor=Card)){Row(Modifier.fillMaxWidth().padding(22.dp),verticalAlignment=Alignment.CenterVertically){Column(Modifier.weight(1f)){Text("Total Leads",fontSize=18.sp,fontWeight=FontWeight.Bold);Text(leads.size.toString(),fontSize=36.sp,fontWeight=FontWeight.Bold)};Text("More Conversations\nMore Happy Customers",color=Muted)}}};items(leads,key={it.id}){LeadRow(c,store,it,refresh)};if(leads.isEmpty())item{Text("No customer leads yet",color=Muted,modifier=Modifier.padding(40.dp))}}}
@Composable fun LeadRow(c:Context,store:LeadStore,l:Lead,refresh:()->Unit){var del by remember{mutableStateOf(false)};val now=System.currentTimeMillis();val dueAt=l.actionDueAt?:l.updatedAt+86400000L;val progress=min(1f,max(0f,(now-(dueAt-86400000L)).toFloat()/86400000f));val completed=l.actionState=="DONE";val due=!completed&&now>=dueAt;val hours=max(0L,(dueAt-now+3599999)/3600000);ElevatedCard(Modifier.fillMaxWidth().shadow(if(due)14.dp else 9.dp,RoundedCornerShape(20.dp)),shape=RoundedCornerShape(20.dp),colors=CardDefaults.elevatedCardColors(containerColor=Card)){Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){Text(if(l.name.isBlank())"Customer" else l.name,fontSize=20.sp,fontWeight=FontWeight.Bold);Info(Icons.Default.Phone,l.phone);Info(Icons.Default.DirectionsCar,"${l.type} · ${l.vehicle}");Info(Icons.Default.CalendarMonth,"Added: ${date(l.updatedAt)}");Text(when{completed->"Follow-up completed";due->"Follow-up due now";else->"$hours hours left"},color=if(due)Red else Green,fontWeight=FontWeight.Bold);LinearProgressIndicator(progress={if(completed)1f else progress},modifier=Modifier.fillMaxWidth().height(9.dp).clip(RoundedCornerShape(8.dp)),color=if(due)Red else Green);if(due)Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){Button({whatsapp(c,l.phone,l.name,l.vehicle);store.setAction(l.phone,"WHATSAPP");refresh()},Modifier.weight(1f),colors=ButtonDefaults.buttonColors(containerColor=Green)){Text("WhatsApp")};Button({startCall(c,l.phone);store.setAction(l.phone,"CALLING");c.getSharedPreferences("call_state",Context.MODE_PRIVATE).edit().putString("pending_followup_call",l.phone).apply()},Modifier.weight(1f)){Text("Call")}};Button({del=true},Modifier.align(Alignment.End),colors=ButtonDefaults.buttonColors(containerColor=Red)){Icon(Icons.Default.Delete,null);Text(" Delete")}}};if(del)AlertDialog(onDismissRequest={del=false},title={Text("Delete lead?")},text={Text("This customer lead will be permanently removed.")},confirmButton={TextButton({store.delete(l.phone);del=false;refresh()}){Text("DELETE")}},dismissButton={TextButton({del=false}){Text("CANCEL")}})}
@Composable fun Info(icon:androidx.compose.ui.graphics.vector.ImageVector,text:String){Row(verticalAlignment=Alignment.CenterVertically){Icon(icon,null,tint=Muted,modifier=Modifier.size(17.dp));Spacer(Modifier.width(7.dp));Text(text,color=Muted,fontSize=14.sp)}}

@Composable fun AddLead(c:Context,store:LeadStore,seed:String,done:()->Unit){
 val phone=LeadStore.normalize(seed);val old=remember(phone){store.find(phone)};var name by remember{mutableStateOf(old?.name.orEmpty())};var type by remember{mutableStateOf(old?.type?:"Car")};var vehicle by remember{mutableStateOf(old?.vehicle.orEmpty())};var budget by remember{mutableStateOf(old?.budget.orEmpty())};var notes by remember{mutableStateOf(old?.notes.orEmpty())};var check by remember{mutableStateOf<List<String>?>(null)}
 LazyColumn(Modifier.fillMaxSize().background(Navy).padding(horizontal=20.dp),contentPadding=PaddingValues(top=18.dp,bottom=30.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
  item{Brand();Spacer(Modifier.height(10.dp));Text("Add New Lead",fontSize=28.sp,fontWeight=FontWeight.Bold);Text("New Customer Enquiry",color=Muted)}
  item{ElevatedCard(Modifier.fillMaxWidth().shadow(14.dp,RoundedCornerShape(22.dp)),shape=RoundedCornerShape(22.dp),colors=CardDefaults.elevatedCardColors(containerColor=Card)){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
   Label("Customer Name",false);Field("Enter customer name",name){name=it}
   Label("Phone Number",true);Surface(color=Color(0xFF203653),shape=RoundedCornerShape(14.dp),modifier=Modifier.fillMaxWidth()){Row(Modifier.padding(16.dp),verticalAlignment=Alignment.CenterVertically){Icon(Icons.Default.Phone,null,tint=Color.White);Spacer(Modifier.width(12.dp));Text(if(phone.isBlank())"Number unavailable" else phone,fontSize=17.sp,color=Color.White)}}
   Label("Vehicle Interested",true);Row{FilterChip(type=="Car",{type="Car"},{Text("CAR")});Spacer(Modifier.width(10.dp));FilterChip(type=="Bike",{type="Bike"},{Text("BIKE")})}
   Field("Vehicle model / requirement",vehicle){vehicle=it}
   Label("Preferred Budget",false);Field("e.g. 5 - 10 Lakhs",budget){budget=it}
   Label("Additional Notes",false);OutlinedTextField(notes,{notes=it},placeholder={Text("Add any details about the customer enquiry...")},modifier=Modifier.fillMaxWidth().height(120.dp),shape=RoundedCornerShape(14.dp))
   Surface(color=Color(0xFF0D3B69),shape=RoundedCornerShape(18.dp),modifier=Modifier.fillMaxWidth()){Row(Modifier.padding(16.dp)){Icon(Icons.Default.Info,null,tint=Color(0xFF5AB5FF));Spacer(Modifier.width(12.dp));Column{Text("Please fill all required fields",fontWeight=FontWeight.Bold);Text("Only Phone Number and Vehicle Interested are mandatory. Customer Name is optional.",color=Muted)}}}
   Button({check=buildList{if(phone.isBlank())add("Phone Number");if(vehicle.isBlank())add("Vehicle Interested")}},Modifier.fillMaxWidth().height(60.dp).shadow(10.dp),shape=RoundedCornerShape(16.dp)){Icon(Icons.Default.Save,null);Spacer(Modifier.width(8.dp));Text("Review & Save Lead",fontSize=17.sp,fontWeight=FontWeight.Bold)}
  }}}
 }
 check?.let{missing->AlertDialog(onDismissRequest={check=null},title={Text(if(missing.isEmpty())"Confirm Lead" else "Required Fields Missing")},text={Text(if(missing.isEmpty())"Save this lead?\n\nName: ${name.ifBlank{"Not provided"}}\nPhone: $phone\nVehicle: $type · $vehicle\nBudget: ${budget.ifBlank{"Not provided"}}" else "Please complete:\n• ${missing.joinToString("\n• ")}")},confirmButton={if(missing.isEmpty()){{TextButton({val due=System.currentTimeMillis()+86400000L;store.save(phone,name,type,vehicle,budget,"New",notes,due);schedule24(c,phone,vehicle,due);Toast.makeText(c,"Lead added successfully",Toast.LENGTH_LONG).show();check=null;done()}){Text("SAVE LEAD")}}}else null,dismissButton={TextButton({check=null}){Text(if(missing.isEmpty())"BACK" else "OK")}})}
}
@Composable fun Label(text:String,required:Boolean){Row{Text(text,fontWeight=FontWeight.Bold,fontSize=16.sp);if(required)Text(" *",color=Red,fontWeight=FontWeight.Bold)}}
@Composable fun Field(label:String,value:String,set:(String)->Unit){OutlinedTextField(value,set,placeholder={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true,shape=RoundedCornerShape(14.dp))}
fun date(ms:Long)=SimpleDateFormat("dd MMM yyyy, hh:mm a",Locale.getDefault()).format(Date(ms))
fun schedule24(c:Context,p:String,v:String,at:Long){val am=c.getSystemService(Context.ALARM_SERVICE) as AlarmManager;val pi=PendingIntent.getBroadcast(c,p.hashCode(),Intent(c,ReminderReceiver::class.java).putExtra("phone",p).putExtra("vehicle",v),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE);am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pi)}
fun whatsapp(c:Context,p:String,n:String,v:String){val text="Hello ${n.ifBlank{"Sir/Madam"}}, this is LRS Motors. You had enquired about ${v.ifBlank{"a vehicle"}}. Just following up regarding your requirement. Please let us know if you are still interested. We can also arrange a test drive for you. Thank you — LRS Motors.";c.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://wa.me/91${LeadStore.normalize(p)}?text=${Uri.encode(text)}")))}
fun startCall(c:Context,p:String){val u=Uri.parse("tel:$p");if(ContextCompat.checkSelfPermission(c,Manifest.permission.CALL_PHONE)==PackageManager.PERMISSION_GRANTED)c.startActivity(Intent(Intent.ACTION_CALL,u))else c.startActivity(Intent(Intent.ACTION_DIAL,u))}
