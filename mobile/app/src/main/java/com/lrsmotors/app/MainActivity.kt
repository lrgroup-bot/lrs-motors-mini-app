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
        setContent { LrsApp(this, phone, intent.hasExtra("action_phone")) }
    }
}

@Composable
fun LrsApp(context: Context, initialPhone: String?, actionIntent: Boolean) {
    val store = remember { LeadStore(context) }
    val sims = remember { SimCallResolver.sims(context) }
    var page by remember { mutableStateOf(if (SimCallResolver.selected(context) == null) "setup" else if (actionIntent) "action" else if (initialPhone.isNullOrBlank()) "dashboard" else "add") }
    var phone by remember { mutableStateOf(initialPhone.orEmpty()) }
    var refresh by remember { mutableIntStateOf(0) }

    MaterialTheme(colorScheme = darkColorScheme()) {
        when (page) {
            "setup" -> Setup(context, sims) { page = "dashboard" }
            "add" -> AddLead(context, store, phone) { refresh++; page = "dashboard" }
            "action" -> FollowUp(context, store, phone) { refresh++; page = "dashboard" }
            else -> Dashboard(store, refresh, openDue = { phone = it; page = "action" }, refresh = { refresh++ })
        }
    }
}

@Composable
fun Setup(context: Context, sims: List<SimChoice>, done: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("LRS MOTORS", style = MaterialTheme.typography.headlineLarge)
        Text("Select Business SIM", style = MaterialTheme.typography.titleLarge)
        Text("Only calls on this SIM will create lead notifications.")
        sims.forEach { sim -> Button(onClick = { SimCallResolver.saveSelected(context, sim.subscriptionId); done() }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text(sim.label) } }
        if (sims.isEmpty()) Text("Allow Phone and Call Log permissions, then reopen the app.")
    }
}

@Composable
fun Dashboard(store: LeadStore, refreshKey: Int, openDue: (String) -> Unit, refresh: () -> Unit) {
    val leads = remember(refreshKey) { store.all() }
    val now = System.currentTimeMillis()
    val due = leads.filter { it.actionState != "DONE" && it.actionDueAt != null && it.actionDueAt <= now }
    LazyColumn(Modifier.fillMaxSize().padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("LRS MOTORS", style = MaterialTheme.typography.headlineLarge); Text("Customer Leads", style = MaterialTheme.typography.titleLarge) }
        item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Metric("TOTAL LEADS", leads.size.toString(), Modifier.weight(1f)); Metric("24H DUE", due.size.toString(), Modifier.weight(1f)) } }
        if (due.isNotEmpty()) {
            item { Text("24-HOUR FOLLOW-UP", style = MaterialTheme.typography.titleMedium) }
            items(due, key = { "due-${it.id}" }) { lead -> DueCard(lead, openDue) }
        }
        item { Text("ALL LEADS", style = MaterialTheme.typography.titleMedium); if (leads.isEmpty()) Text("No leads saved yet. New callers will appear here after you save them.") }
        items(leads, key = { "lead-${it.id}" }) { lead -> LeadCard(store, lead, refresh) }
    }
}

@Composable
fun DueCard(lead: Lead, open: (String) -> Unit) {
    ElevatedCard(Modifier.fillMaxWidth().shadow(8.dp).clickable { open(lead.phone) }) {
        Column(Modifier.padding(14.dp)) {
            Text(if (lead.name.isBlank()) lead.phone else lead.name, style = MaterialTheme.typography.titleMedium)
            Text("${lead.phone} · ${lead.type} · ${lead.vehicle}")
            Text("24 hours completed · Tap for WhatsApp / Call")
        }
    }
}

@Composable
fun LeadCard(store: LeadStore, lead: Lead, refresh: () -> Unit) {
    var confirmDelete by remember { mutableStateOf(false) }
    ElevatedCard(Modifier.fillMaxWidth().shadow(6.dp)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(if (lead.name.isBlank()) lead.phone else lead.name, style = MaterialTheme.typography.titleLarge)
            Text(lead.phone)
            Text("${lead.type} · ${lead.vehicle}")
            if (lead.budget.isNotBlank()) Text("Budget: ${lead.budget}")
            if (lead.notes.isNotBlank()) Text("Notes: ${lead.notes}")
            OutlinedButton(onClick = { confirmDelete = true }, modifier = Modifier.fillMaxWidth()) { Text("DELETE LEAD") }
        }
    }
    if (confirmDelete) AlertDialog(onDismissRequest = { confirmDelete = false }, title = { Text("Delete lead?") }, text = { Text("This customer lead will be permanently deleted.") }, confirmButton = { TextButton(onClick = { store.delete(lead.phone); confirmDelete = false; refresh() }) { Text("DELETE") } }, dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("CANCEL") } })
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
        Text("Add Caller Lead", style = MaterialTheme.typography.headlineMedium)
        Text(phone, style = MaterialTheme.typography.titleLarge)
        Text("Phone number captured automatically from your selected business SIM.")
        Field("Customer name", name) { name = it }
        Row { FilterChip(selected = type == "Car", onClick = { type = "Car" }, label = { Text("CAR") }); Spacer(Modifier.width(10.dp)); FilterChip(selected = type == "Bike", onClick = { type = "Bike" }, label = { Text("BIKE") }) }
        Field("Vehicle required", vehicle) { vehicle = it }
        Field("Budget", budget) { budget = it }
        Field("Notes", notes) { notes = it }
        Button(onClick = {
            val missing = buildList { if (phone.isBlank()) add("Phone number"); if (name.isBlank()) add("Customer name"); if (vehicle.isBlank()) add("Vehicle required"); if (budget.isBlank()) add("Budget"); if (notes.isBlank()) add("Notes") }
            validation = missing
        }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("REVIEW & SAVE LEAD") }
    }

    validation?.let { missing ->
        AlertDialog(
            onDismissRequest = { validation = null },
            title = { Text(if (missing.isEmpty()) "Confirm Lead" else "Check Empty Fields") },
            text = { Text(if (missing.isEmpty()) "All fields are filled. Save this lead?" else "These fields are empty:\n• ${missing.joinToString("\n• ")}\n\nYou can go back and fill them, or continue and save the lead.") },
            confirmButton = { TextButton(onClick = { val due = System.currentTimeMillis() + 86_400_000L; store.save(phone, name, type, vehicle, budget, "New", notes, due); schedule24(context, phone, vehicle, due); Toast.makeText(context, "Lead added successfully", Toast.LENGTH_LONG).show(); validation = null; done() }) { Text(if (missing.isEmpty()) "SAVE" else "SAVE ANYWAY") } },
            dismissButton = { TextButton(onClick = { validation = null }) { Text("GO BACK") } }
        )
    }
}

@Composable
fun FollowUp(context: Context, store: LeadStore, phone: String, done: () -> Unit) {
    val lead = remember(phone) { store.find(phone) }
    var whatsappSelected by remember { mutableStateOf(lead?.actionState == "WHATSAPP") }
    Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("24-Hour Follow-up", style = MaterialTheme.typography.headlineMedium)
        Text(lead?.name?.ifBlank { phone } ?: phone)
        Text(lead?.vehicle.orEmpty())
        if (!whatsappSelected) Button(onClick = { whatsapp(context, phone, lead?.name.orEmpty(), lead?.vehicle.orEmpty()); store.setAction(phone, "WHATSAPP"); whatsappSelected = true }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("WHATSAPP") }
        Button(onClick = { startCall(context, phone); store.setAction(phone, "CALLING"); context.getSharedPreferences("call_state", Context.MODE_PRIVATE).edit().putString("pending_followup_call", phone).apply() }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("CALL") }
        TextButton(onClick = done) { Text("BACK TO DASHBOARD") }
    }
}

@Composable fun Metric(title: String, value: String, modifier: Modifier) { ElevatedCard(modifier.shadow(8.dp)) { Column(Modifier.padding(14.dp)) { Text(value, style = MaterialTheme.typography.headlineMedium); Text(title) } } }
@Composable fun Field(label: String, value: String, set: (String) -> Unit) { OutlinedTextField(value, set, label = { Text(label) }, modifier = Modifier.fillMaxWidth(), singleLine = true) }
fun schedule24(context: Context, phone: String, vehicle: String, at: Long) { val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager; val pending = PendingIntent.getBroadcast(context, phone.hashCode(), Intent(context, ReminderReceiver::class.java).putExtra("phone", phone).putExtra("vehicle", vehicle), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE); alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending) }
fun whatsapp(context: Context, phone: String, name: String, vehicle: String) { val text = "Hello ${name.ifBlank { "Sir/Madam" }}, this is LRS Motors regarding ${vehicle.ifBlank { "your vehicle enquiry" }}. Would you like to book a test drive?"; context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/91${LeadStore.normalize(phone)}?text=${Uri.encode(text)}"))) }
fun startCall(context: Context, phone: String) { val uri = Uri.parse("tel:$phone"); if (ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) context.startActivity(Intent(Intent.ACTION_CALL, uri)) else context.startActivity(Intent(Intent.ACTION_DIAL, uri)) }
