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
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import kotlin.math.max
import kotlin.math.min

class MainActivity : ComponentActivity() {
    private val perms = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { recreate() }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        perms.launch(arrayOf(Manifest.permission.READ_PHONE_STATE, Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_PHONE_NUMBERS, Manifest.permission.CALL_PHONE, Manifest.permission.POST_NOTIFICATIONS))
        val phone = intent.getStringExtra("action_phone") ?: intent.getStringExtra("after_call_phone")
        setContent { LrsApp(this, phone) }
    }
}

@Composable
fun LrsApp(context: Context, initialPhone: String?) {
    val store = remember { LeadStore(context) }
    val sims = remember { SimCallResolver.sims(context) }
    var page by remember { mutableStateOf(if (SimCallResolver.selected(context) == null) "setup" else if (initialPhone.isNullOrBlank()) "dashboard" else "add") }
    var refresh by remember { mutableIntStateOf(0) }
    MaterialTheme(colorScheme = darkColorScheme()) {
        when (page) {
            "setup" -> Setup(context, sims) { page = "dashboard" }
            "add" -> AddLead(context, store, initialPhone.orEmpty()) { refresh++; page = "dashboard" }
            else -> Dashboard(context, store, refresh) { refresh++ }
        }
    }
}

@Composable
fun Setup(context: Context, sims: List<SimChoice>, done: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("LRS MOTORS", style = MaterialTheme.typography.headlineLarge)
        Text("Select Business SIM", style = MaterialTheme.typography.titleLarge)
        Text("Only this SIM will be used for customer lead calls.")
        sims.forEach { sim -> Button(onClick = { SimCallResolver.saveSelected(context, sim.subscriptionId); done() }, modifier = Modifier.fillMaxWidth().height(58.dp).shadow(8.dp)) { Text(sim.label) } }
        if (sims.isEmpty()) Text("Allow Phone and Call Log permissions, then reopen the app.")
    }
}

@Composable
fun Dashboard(context: Context, store: LeadStore, refreshKey: Int, refresh: () -> Unit) {
    val leads = remember(refreshKey) { store.all() }
    LazyColumn(Modifier.fillMaxSize().padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("LRS MOTORS", style = MaterialTheme.typography.headlineLarge); Text("Customer Leads", style = MaterialTheme.typography.titleLarge); Text("${leads.size} active lead${if (leads.size == 1) "" else "s"}") }
        if (leads.isEmpty()) item { ElevatedCard(Modifier.fillMaxWidth().shadow(8.dp)) { Text("No leads yet. After a business call, save the caller and the lead will appear here.", Modifier.padding(18.dp)) } }
        items(leads, key = { it.id }) { lead -> LeadCard(context, store, lead, refresh) }
    }
}

@Composable
fun LeadCard(context: Context, store: LeadStore, lead: Lead, refresh: () -> Unit) {
    var confirmDelete by remember { mutableStateOf(false) }
    val now = System.currentTimeMillis()
    val dueAt = lead.actionDueAt ?: (lead.updatedAt + 86_400_000L)
    val startAt = dueAt - 86_400_000L
    val progress = min(1f, max(0f, (now - startAt).toFloat() / 86_400_000f))
    val due = now >= dueAt && lead.actionState != "DONE"
    val completed = lead.actionState == "DONE"
    val hoursLeft = max(0L, (dueAt - now + 3_599_999L) / 3_600_000L)

    ElevatedCard(Modifier.fillMaxWidth().shadow(if (due) 14.dp else 7.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(if (lead.name.isBlank()) lead.phone else lead.name, style = MaterialTheme.typography.titleLarge)
            Text(lead.phone)
            Text("${lead.type} · ${lead.vehicle}")
            if (lead.budget.isNotBlank()) Text("Budget: ${lead.budget}")
            LinearProgressIndicator(progress = { if (completed) 1f else progress }, modifier = Modifier.fillMaxWidth().height(10.dp))
            Text(when { completed -> "Follow-up completed"; due -> "Follow-up due now"; else -> "Follow-up in $hoursLeft hour${if (hoursLeft == 1L) "" else "s"}" })
            if (due) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = { whatsapp(context, lead.phone, lead.name, lead.vehicle); store.setAction(lead.phone, "WHATSAPP"); refresh() }, modifier = Modifier.weight(1f).shadow(6.dp)) { Text("WHATSAPP") }
                    Button(onClick = { startCall(context, lead.phone); store.setAction(lead.phone, "CALLING"); context.getSharedPreferences("call_state", Context.MODE_PRIVATE).edit().putString("pending_followup_call", lead.phone).apply() }, modifier = Modifier.weight(1f).shadow(6.dp)) { Text("CALL") }
                }
            }
            OutlinedButton(onClick = { confirmDelete = true }, modifier = Modifier.fillMaxWidth()) { Text("DELETE") }
        }
    }
    if (confirmDelete) AlertDialog(onDismissRequest = { confirmDelete = false }, title = { Text("Delete lead?") }, text = { Text("This lead will be permanently removed.") }, confirmButton = { TextButton(onClick = { store.delete(lead.phone); confirmDelete = false; refresh() }) { Text("DELETE") } }, dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("CANCEL") } })
}

@Composable
fun AddLead(context: Context, store: LeadStore, seed: String, done: () -> Unit) {
    val phone = LeadStore.normalize(seed)
    val old = remember(phone) { store.find(phone) }
    var name by remember { mutableStateOf(old?.name.orEmpty()) }
    var type by remember { mutableStateOf(old?.type ?: "Car") }
    var vehicle by remember { mutableStateOf(old?.vehicle.orEmpty()) }
    var budget by remember { mutableStateOf(old?.budget.orEmpty()) }
    var notes by remember { mutableStateOf(old?.notes.orEmpty()) }
    var validation by remember { mutableStateOf<List<String>?>(null) }
    Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("New Caller", style = MaterialTheme.typography.headlineMedium)
        Text(phone, style = MaterialTheme.typography.titleLarge)
        Row { FilterChip(selected = type == "Car", onClick = { type = "Car" }, label = { Text("CAR") }); Spacer(Modifier.width(10.dp)); FilterChip(selected = type == "Bike", onClick = { type = "Bike" }, label = { Text("BIKE") }) }
        Field("Customer name", name) { name = it }
        Field("Vehicle required", vehicle) { vehicle = it }
        Field("Budget", budget) { budget = it }
        Field("Notes", notes) { notes = it }
        Button(onClick = { validation = buildList { if (phone.isBlank()) add("Phone number"); if (name.isBlank()) add("Customer name"); if (vehicle.isBlank()) add("Vehicle required"); if (budget.isBlank()) add("Budget"); if (notes.isBlank()) add("Notes") } }, modifier = Modifier.fillMaxWidth().height(58.dp).shadow(8.dp)) { Text("SAVE LEAD") }
    }
    validation?.let { missing -> AlertDialog(onDismissRequest = { validation = null }, title = { Text(if (missing.isEmpty()) "Save this lead?" else "Empty fields") }, text = { Text(if (missing.isEmpty()) "Everything is ready." else "Empty: ${missing.joinToString(", ")}\n\nGo back to fill them, or save anyway.") }, confirmButton = { TextButton(onClick = { val due = System.currentTimeMillis() + 86_400_000L; store.save(phone, name, type, vehicle, budget, "New", notes, due); schedule24(context, phone, vehicle, due); Toast.makeText(context, "Lead added", Toast.LENGTH_LONG).show(); validation = null; done() }) { Text("SAVE") } }, dismissButton = { TextButton(onClick = { validation = null }) { Text("BACK") } }) }
}

@Composable fun Field(label: String, value: String, set: (String) -> Unit) { OutlinedTextField(value, set, label = { Text(label) }, modifier = Modifier.fillMaxWidth(), singleLine = true) }
fun schedule24(context: Context, phone: String, vehicle: String, at: Long) { val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager; val pending = PendingIntent.getBroadcast(context, phone.hashCode(), Intent(context, ReminderReceiver::class.java).putExtra("phone", phone).putExtra("vehicle", vehicle), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE); alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending) }
fun whatsapp(context: Context, phone: String, name: String, vehicle: String) { val text = "Hello ${name.ifBlank { "Sir/Madam" }}, this is LRS Motors regarding ${vehicle.ifBlank { "your vehicle enquiry" }}. Would you like to book a test drive?"; context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/91${LeadStore.normalize(phone)}?text=${Uri.encode(text)}"))) }
fun startCall(context: Context, phone: String) { val uri = Uri.parse("tel:$phone"); if (ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) context.startActivity(Intent(Intent.ACTION_CALL, uri)) else context.startActivity(Intent(Intent.ACTION_DIAL, uri)) }
