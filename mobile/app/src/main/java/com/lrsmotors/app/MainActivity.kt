package com.lrsmotors.app

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private val permissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        permissions.launch(arrayOf(Manifest.permission.READ_PHONE_STATE, Manifest.permission.READ_CALL_LOG, Manifest.permission.CALL_PHONE, Manifest.permission.POST_NOTIFICATIONS))
        setContent { LeadApp(this, intent.getStringExtra("after_call_phone")) }
    }
}

@Composable
fun LeadApp(context: Context, initialPhone: String?) {
    val store = remember { LeadStore(context) }
    var screen by remember { mutableStateOf(if(initialPhone.isNullOrBlank()) "home" else "edit") }
    var selectedPhone by remember { mutableStateOf(initialPhone.orEmpty()) }
    MaterialTheme {
        Scaffold(bottomBar={ NavigationBar {
            listOf("home" to "Dashboard","leads" to "Leads","new" to "+ Lead").forEach { (key,label) -> NavigationBarItem(selected=screen==key,onClick={screen=key},icon={},label={Text(label)}) }
        }}) { p ->
            Box(Modifier.padding(p)) { when(screen) {
                "leads" -> LeadsScreen(store) { selectedPhone=it; screen="edit" }
                "new" -> LeadEditor(context,store,"") { screen="leads" }
                "edit" -> LeadEditor(context,store,selectedPhone) { screen="leads" }
                else -> Dashboard(store, onNew={screen="new"}, onOpen={selectedPhone=it;screen="edit"})
            }}
        }
    }
}

@Composable fun Dashboard(store: LeadStore,onNew:()->Unit,onOpen:(String)->Unit) {
    var tick by remember { mutableIntStateOf(0) }; val all=remember(tick){store.all()}; val due=remember(tick){store.due()}
    LazyColumn(Modifier.fillMaxSize().padding(18.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
        item { Text("LRS Lead AI",style=MaterialTheme.typography.headlineMedium); Text("Call → Lead → Follow-up → Test Drive") }
        item { Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){ Metric("Leads",all.size.toString(),Modifier.weight(1f));Metric("Due",due.size.toString(),Modifier.weight(1f));Metric("Hot",all.count{it.status=="Hot"}.toString(),Modifier.weight(1f)) } }
        item { Button(onClick=onNew,modifier=Modifier.fillMaxWidth()){Text("+ Add call lead")}; TextButton(onClick={tick++}){Text("Refresh")}; Text("Follow-ups",style=MaterialTheme.typography.titleLarge) }
        items(due){ LeadCard(it,onOpen) }
    }
}
@Composable fun Metric(t:String,v:String,m:Modifier){Card(m){Column(Modifier.padding(12.dp)){Text(v,style=MaterialTheme.typography.headlineSmall);Text(t)}}}

@Composable fun LeadsScreen(store:LeadStore,onOpen:(String)->Unit){ var q by remember{mutableStateOf("")}; var tick by remember{mutableIntStateOf(0)}; val leads=remember(q,tick){store.all(q)}
    Column(Modifier.fillMaxSize().padding(18.dp)){Text("Customer Leads",style=MaterialTheme.typography.headlineMedium);OutlinedTextField(q,{q=it},label={Text("Search phone, name, car/bike, budget")},modifier=Modifier.fillMaxWidth());TextButton({tick++}){Text("Refresh")};LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){items(leads){LeadCard(it,onOpen)}}}
}
@Composable fun LeadCard(l:Lead,onOpen:(String)->Unit){Card(Modifier.fillMaxWidth().clickable{onOpen(l.phone)}){Column(Modifier.padding(14.dp)){Text(if(l.name.isBlank()) l.phone else l.name,style=MaterialTheme.typography.titleMedium);Text("${l.phone} · ${l.type} · ${l.status}");if(l.vehicle.isNotBlank())Text(l.vehicle);if(l.budget.isNotBlank())Text("Budget: ${l.budget}")}}}

@Composable fun LeadEditor(context:Context,store:LeadStore,phoneSeed:String,onDone:()->Unit){ val old=remember(phoneSeed){if(phoneSeed.isBlank())null else store.find(phoneSeed)}; var phone by remember{mutableStateOf(old?.phone?:phoneSeed)};var name by remember{mutableStateOf(old?.name.orEmpty())};var type by remember{mutableStateOf(old?.type?:"Car")};var vehicle by remember{mutableStateOf(old?.vehicle.orEmpty())};var budget by remember{mutableStateOf(old?.budget.orEmpty())};var status by remember{mutableStateOf(old?.status?:"New")};var notes by remember{mutableStateOf(old?.notes.orEmpty())}
    LazyColumn(Modifier.fillMaxSize().padding(18.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){item{Text(if(old==null)"New Call Lead" else "Customer History",style=MaterialTheme.typography.headlineMedium)};item{F("Phone number",phone){phone=it}};item{F("Customer name (optional)",name){name=it}};item{Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){FilterChip(type=="Car",{type="Car"},{Text("Car")});FilterChip(type=="Bike",{type="Bike"},{Text("Bike")})}};item{F("Vehicle wanted (e.g. Creta 2022)",vehicle){vehicle=it}};item{F("Budget",budget){budget=it}};item{F("Notes / finance / exchange",notes){notes=it}};item{Row(horizontalArrangement=Arrangement.spacedBy(5.dp)){listOf("New","Hot","Warm","Purchased","Lost").forEach{FilterChip(status==it,{status=it},{Text(it)})}}};item{Button({store.save(phone,name,type,vehicle,budget,status,notes);onDone()},Modifier.fillMaxWidth()){Text("Save Lead")}};item{Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){Button({call(context,phone)},Modifier.weight(1f)){Text("Call")};Button({whatsapp(context,phone,name,vehicle)},Modifier.weight(1f)){Text("WhatsApp")}}};item{Text("Follow-up reminder",style=MaterialTheme.typography.titleMedium)};item{Row(horizontalArrangement=Arrangement.spacedBy(6.dp)){listOf("1h" to 3600000L,"Tomorrow" to 86400000L,"3 Days" to 259200000L).forEach{(label,ms)->OutlinedButton({val at=System.currentTimeMillis()+ms;store.save(phone,name,type,vehicle,budget,status,notes,at);schedule(context,phone,vehicle,at)}){Text(label)}}}};item{Button({val at=System.currentTimeMillis()+86400000L;store.save(phone,name,type,vehicle,budget,"Hot",notes,null,at); whatsapp(context,phone,name,"Test drive: $vehicle")},Modifier.fillMaxWidth()){Text("Book Test Drive · Tomorrow")}} }
}
@Composable fun F(label:String,value:String,set:(String)->Unit){OutlinedTextField(value,set,label={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true)}
fun call(c:Context,p:String){if(ContextCompat.checkSelfPermission(c,Manifest.permission.CALL_PHONE)==PackageManager.PERMISSION_GRANTED)c.startActivity(Intent(Intent.ACTION_CALL,Uri.parse("tel:$p"))) else c.startActivity(Intent(Intent.ACTION_DIAL,Uri.parse("tel:$p")))}
fun whatsapp(c:Context,p:String,n:String,v:String){val text="Hello ${n.ifBlank{"Sir/Madam"}}, thank you for contacting LRS Motors.${if(v.isBlank())"" else " Regarding $v."} Please let us know a convenient time for a test drive.";val uri=Uri.parse("https://wa.me/91${LeadStore.normalize(p)}?text=${Uri.encode(text)}");c.startActivity(Intent(Intent.ACTION_VIEW,uri))}
fun schedule(c:Context,p:String,v:String,at:Long){val am=c.getSystemService(Context.ALARM_SERVICE) as AlarmManager;val i=Intent(c,ReminderReceiver::class.java).putExtra("phone",p).putExtra("vehicle",v);val pi=PendingIntent.getBroadcast(c,p.hashCode(),i,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE);if(android.os.Build.VERSION.SDK_INT>=31 && !am.canScheduleExactAlarms()){c.startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:${c.packageName}")))}else am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pi)}