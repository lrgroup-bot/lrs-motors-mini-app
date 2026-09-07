package com.lrsmotors.app

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private val perms = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { recreate() }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        perms.launch(arrayOf(Manifest.permission.READ_PHONE_STATE, Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_PHONE_NUMBERS, Manifest.permission.CALL_PHONE, Manifest.permission.POST_NOTIFICATIONS))
        val phone = intent.getStringExtra("action_phone") ?: intent.getStringExtra("after_call_phone")
        setContent { App(this, phone, intent.hasExtra("action_phone")) }
    }
}

@Composable
fun App(context: Context, initialPhone: String?, actionIntent: Boolean) {
    val store = remember { LeadStore(context) }
    val sims = remember { SimCallResolver.sims(context) }
    var page by remember { mutableStateOf(if (SimCallResolver.selected(context) == null) "setup" else if (actionIntent) "action" else if (initialPhone.isNullOrBlank()) "home" else "edit") }
    var phone by remember { mutableStateOf(initialPhone.orEmpty()) }
    var refresh by remember { mutableIntStateOf(0) }

    MaterialTheme(colorScheme = darkColorScheme()) {
        if (page == "setup") {
            Setup(context, sims) { page = "home" }
        } else {
            Scaffold(bottomBar = {
                NavigationBar {
                    NavigationBarItem(selected = page == "home", onClick = { page = "home" }, icon = {}, label = { Text("Home") })
                    NavigationBarItem(selected = page == "leads", onClick = { page = "leads" }, icon = {}, label = { Text("Leads") })
                    NavigationBarItem(selected = false, onClick = { page = "setup" }, icon = {}, label = { Text("Business SIM") })
                }
            }) { padding ->
                Box(Modifier.padding(padding)) {
                    when (page) {
                        "leads" -> Leads(store, refresh) { phone = it; page = "edit" }
                        "edit" -> Editor(context, store, phone) { refresh++; page = "leads" }
                        "action" -> Action(context, store, phone)
                        else -> Dash(store, refresh, action = { phone = it; page = "action" }, all = { page = "leads" }, refresh = { refresh++ })
                    }
                }
            }
        }
    }
}

@Composable
fun Setup(context: Context, sims: List<SimChoice>, done: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("LRS MOTORS", style = MaterialTheme.typography.headlineLarge)
        Text("Business Call Intelligence")
        Text("Choose the SIM used for customer enquiries. Other SIM calls are ignored.")
        sims.forEach { sim -> Button(onClick = { SimCallResolver.saveSelected(context, sim.subscriptionId); done() }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text(sim.label) } }
        if (sims.isEmpty()) Text("Allow Phone + Call Log permissions and reopen the app.")
    }
}

@Composable
fun Dash(store: LeadStore, refreshKey: Int, action: (String) -> Unit, all: () -> Unit, refresh: () -> Unit) {
    val leads = remember(refreshKey) { store.all() }
    val now = System.currentTimeMillis()
    val due = leads.filter { it.actionState != "DONE" && it.actionDueAt != null && it.actionDueAt <= now }
    LazyColumn(Modifier.fillMaxSize().padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { Text("LRS MOTORS", style = MaterialTheme.typography.headlineLarge); Text("Lead Command Center") }
        item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Metric("TOTAL", leads.size.toString(), Modifier.weight(1f)); Metric("HOT", leads.count { it.status == "Hot" }.toString(), Modifier.weight(1f)); Metric("DUE NOW", due.size.toString(), Modifier.weight(1f)) } }
        item { Button(onClick = all, modifier = Modifier.fillMaxWidth().height(54.dp)) { Text("OPEN LEAD DATABASE") } }
        item { Text("24-HOUR ACTIONS", style = MaterialTheme.typography.titleLarge); Text(if (due.isEmpty()) "No customers have completed the 24-hour timeline." else "These customers are ready for follow-up.") }
        items(due, key = { it.id }) { lead -> DashboardLeadCard(store, lead, action, refresh) }
    }
}

@Composable
fun DashboardLeadCard(store: LeadStore, lead: Lead, action: (String) -> Unit, refresh: () -> Unit) {
    var confirmDelete by remember { mutableStateOf(false) }
    Card(Modifier.fillMaxWidth().shadow(10.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.fillMaxWidth().clickable { action(lead.phone) }) {
                Text(if (lead.name.isBlank()) lead.phone else lead.name, style = MaterialTheme.typography.titleLarge)
                Text(lead.phone)
                Text("${lead.type} · ${lead.vehicle}")
                Text("24 hours completed · Tap for WhatsApp / Call")
            }
            OutlinedButton(onClick = { confirmDelete = true }, modifier = Modifier.fillMaxWidth()) { Text("DELETE LEAD") }
        }
    }
    if (confirmDelete) {
        AlertDialog(onDismissRequest = { confirmDelete = false }, title = { Text("Delete this lead?") }, text = { Text("${if (lead.name.isBlank()) lead.phone else lead.name} will be permanently removed from the lead database and dashboard.") }, confirmButton = { TextButton(onClick = { store.delete(lead.phone); confirmDelete = false; refresh() }) { Text("DELETE") } }, dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("CANCEL") } })
    }
}

@Composable fun Metric(title: String, value: String, modifier: Modifier) { ElevatedCard(modifier.shadow(8.dp)) { Column(Modifier.padding(14.dp)) { Text(value, style = MaterialTheme.typography.headlineMedium); Text(title) } } }

@Composable
fun Leads(store: LeadStore, refreshKey: Int, open: (String) -> Unit) {
    var query by remember { mutableStateOf("") }; var localRefresh by remember { mutableIntStateOf(0) }; val leads = remember(query, refreshKey, localRefresh) { store.all(query) }
    Column(Modifier.fillMaxSize().padding(18.dp)) {
        Text("Lead Database", style = MaterialTheme.typography.headlineMedium); Text("Only callers saved from the selected business SIM")
        OutlinedTextField(query, { query = it }, label = { Text("Search number, name, car or bike") }, modifier = Modifier.fillMaxWidth())
        LazyColumn { items(leads, key = { it.id }) { lead -> ElevatedCard(Modifier.fillMaxWidth().padding(vertical = 6.dp).shadow(6.dp)) { Column(Modifier.padding(14.dp)) { Column(Modifier.clickable { open(lead.phone) }) { Text(if (lead.name.isBlank()) lead.phone else lead.name, style = MaterialTheme.typography.titleMedium); Text(lead.phone); Text("${lead.type} · ${lead.vehicle} · ${lead.status}") }; TextButton(onClick = { store.delete(lead.phone); localRefresh++ }) { Text("Delete") } } } } }
    }
}

@Composable
fun Editor(context: Context, store: LeadStore, seed: String, done: () -> Unit) {
    val phone = LeadStore.normalize(seed); val old = remember(phone) { store.find(phone) }; var name by remember { mutableStateOf(old?.name.orEmpty()) }; var type by remember { mutableStateOf(old?.type ?: "Car") }; var vehicle by remember { mutableStateOf(old?.vehicle.orEmpty()) }; var budget by remember { mutableStateOf(old?.budget.orEmpty()) }; var notes by remember { mutableStateOf(old?.notes.orEmpty()) }
    LazyColumn(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("New Caller", style = MaterialTheme.typography.headlineMedium); Text(phone, style = MaterialTheme.typography.titleLarge); Text("Captured automatically from business SIM") }
        item { Field("Name (optional)", name) { name = it } }
        item { Row { FilterChip(selected = type == "Car", onClick = { type = "Car" }, label = { Text("CAR") }); Spacer(Modifier.width(10.dp)); FilterChip(selected = type == "Bike", onClick = { type = "Bike" }, label = { Text("BIKE") }) } }
        item { Field("Vehicle required", vehicle) { vehicle = it } }; item { Field("Budget (optional)", budget) { budget = it } }; item { Field("Notes (optional)", notes) { notes = it } }
        item { Button(onClick = { val due = System.currentTimeMillis() + 86_400_000L; store.save(phone, name, type, vehicle, budget, "New", notes, due); schedule24(context, phone, vehicle, due); done() }, enabled = phone.isNotBlank() && vehicle.isNotBlank(), modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("SAVE CUSTOMER LEAD") } }
    }
}

@Composable
fun Action(context: Context, store: LeadStore, phone: String) {
    val lead = remember(phone) { store.find(phone) }; var whatsappSelected by remember { mutableStateOf(lead?.actionState == "WHATSAPP") }
    Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Customer Action", style = MaterialTheme.typography.headlineMedium); Text(lead?.name?.ifBlank { phone } ?: phone); Text(lead?.vehicle.orEmpty())
        if (!whatsappSelected) Button(onClick = { whatsapp(context, phone, lead?.name.orEmpty(), lead?.vehicle.orEmpty()); store.setAction(phone, "WHATSAPP"); whatsappSelected = true }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("WHATSAPP") }
        Button(onClick = { startCall(context, phone); store.setAction(phone, "CALLING"); context.getSharedPreferences("call_state", Context.MODE_PRIVATE).edit().putString("pending_followup_call", phone).apply() }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("CALL CUSTOMER") }
        Text("After the follow-up call ends, this item disappears from the dashboard.")
    }
}

@Composable fun Field(label: String, value: String, set: (String) -> Unit) { OutlinedTextField(value, set, label = { Text(label) }, modifier = Modifier.fillMaxWidth(), singleLine = true) }
fun schedule24(context: Context, phone: String, vehicle: String, at: Long) { val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager; val pending = PendingIntent.getBroadcast(context, phone.hashCode(), Intent(context, ReminderReceiver::class.java).putExtra("phone", phone).putExtra("vehicle", vehicle), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE); alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending) }
fun whatsapp(context: Context, phone: String, name: String, vehicle: String) { val text = "Hello ${name.ifBlank { "Sir/Madam" }}, this is LRS Motors regarding ${vehicle.ifBlank { "your vehicle enquiry" }}. Would you like to book a test drive?"; context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/91${LeadStore.normalize(phone)}?text=${Uri.encode(text)}"))) }
fun startCall(context: Context, phone: String) { val uri = Uri.parse("tel:$phone"); if (ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) context.startActivity(Intent(Intent.ACTION_CALL, uri)) else context.startActivity(Intent(Intent.ACTION_DIAL, uri)) }
